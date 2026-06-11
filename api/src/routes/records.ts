import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import db from '../db';
import { TripRecord, TripRecordFormData, ImageOrderItem } from '../../../shared/types';

const router = Router();

const uploadDir = process.env.UPLOAD_DIR || './api/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `trip-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('只支持 JPG、PNG、WEBP 格式图片'));
  }
});

function mapDbToRecord(row: any): TripRecord {
  return {
    id: row.id,
    trainNumber: row.train_number,
    trainType: row.train_type,
    departureStation: row.departure_station,
    arrivalStation: row.arrival_station,
    tripDate: row.trip_date,
    scheduledDeparture: row.scheduled_departure,
    actualArrival: row.actual_arrival,
    isDelayed: row.is_delayed === 1,
    delayMinutes: row.delay_minutes,
    seatType: row.seat_type,
    ticketPrice: row.ticket_price,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getRecordImages(recordId: number) {
  const rows = db.prepare('SELECT * FROM trip_images WHERE record_id = ? ORDER BY sort_order, id').all(recordId);
  return rows.map((row: any) => ({
    id: row.id,
    recordId: row.record_id,
    filename: row.filename,
    originalName: row.original_name,
    sortOrder: row.sort_order,
    url: `/uploads/${row.filename}`
  }));
}

router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const { trainNumber, dateFrom, dateTo } = req.query;

  let sql = 'SELECT * FROM trip_records WHERE 1=1';
  const params: any[] = [];

  if (trainNumber) {
    sql += ' AND train_number LIKE ?';
    params.push(`%${trainNumber}%`);
  }
  if (dateFrom) {
    sql += ' AND trip_date >= ?';
    params.push(dateFrom);
  }
  if (dateTo) {
    sql += ' AND trip_date <= ?';
    params.push(dateTo);
  }

  sql += ' ORDER BY trip_date DESC, created_at DESC';

  const rows = db.prepare(sql).all(...params) as any[];
  const records = rows.map(row => {
    const record = mapDbToRecord(row);
    const images = getRecordImages(row.id);
    if (images.length > 0) {
      record.images = [images[0]];
    }
    return record;
  });

  res.json(records);
});

router.get('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const row = db.prepare('SELECT * FROM trip_records WHERE id = ?').get(id) as any;

  if (!row) {
    return res.status(404).json({ error: '记录不存在' });
  }

  const record = mapDbToRecord(row);
  record.images = getRecordImages(row.id);

  res.json(record);
});

router.post('/', authenticateToken, upload.array('images', 20), (req: AuthRequest, res: Response) => {
  const body = req.body as TripRecordFormData;

  if (!body.trainNumber || !body.trainType || !body.departureStation || !body.arrivalStation || !body.tripDate || !body.scheduledDeparture || !body.actualArrival || !body.seatType || body.ticketPrice === undefined) {
    return res.status(400).json({ error: '必填字段不能为空' });
  }

  const insertRecord = db.prepare(`
    INSERT INTO trip_records (
      train_number, train_type, departure_station, arrival_station,
      trip_date, scheduled_departure, actual_arrival, is_delayed,
      delay_minutes, seat_type, ticket_price, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insertRecord.run(
    body.trainNumber,
    body.trainType,
    body.departureStation,
    body.arrivalStation,
    body.tripDate,
    body.scheduledDeparture,
    body.actualArrival,
    body.isDelayed ? 1 : 0,
    body.delayMinutes || 0,
    body.seatType,
    body.ticketPrice,
    body.notes || ''
  );

  const recordId = result.lastInsertRowid as number;

  const files = req.files as Express.Multer.File[] | undefined;
  if (files && files.length > 0) {
    const insertImage = db.prepare('INSERT INTO trip_images (record_id, filename, original_name, sort_order) VALUES (?, ?, ?, ?)');
    files.forEach((file, index) => {
      insertImage.run(recordId, file.filename, file.originalname, index);
    });
  }

  res.status(201).json({ id: recordId, message: '创建成功' });
});

router.put('/:id', authenticateToken, upload.array('images', 20), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const body = req.body as TripRecordFormData & { deletedImages?: string; imageOrder?: string };

  const existing = db.prepare('SELECT id FROM trip_records WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: '记录不存在' });
  }

  const updateRecord = db.prepare(`
    UPDATE trip_records SET
      train_number = ?, train_type = ?, departure_station = ?, arrival_station = ?,
      trip_date = ?, scheduled_departure = ?, actual_arrival = ?, is_delayed = ?,
      delay_minutes = ?, seat_type = ?, ticket_price = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  updateRecord.run(
    body.trainNumber,
    body.trainType,
    body.departureStation,
    body.arrivalStation,
    body.tripDate,
    body.scheduledDeparture,
    body.actualArrival,
    body.isDelayed ? 1 : 0,
    body.delayMinutes || 0,
    body.seatType,
    body.ticketPrice,
    body.notes || '',
    id
  );

  if (body.deletedImages) {
    const deletedIds = JSON.parse(body.deletedImages) as number[];
    if (deletedIds.length > 0) {
      const placeholders = deletedIds.map(() => '?').join(',');
      const imagesToDelete = db.prepare(`SELECT filename FROM trip_images WHERE id IN (${placeholders})`).all(...deletedIds) as { filename: string }[];
      
      imagesToDelete.forEach(img => {
        const filePath = path.join(uploadDir, img.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      db.prepare(`DELETE FROM trip_images WHERE id IN (${placeholders})`).run(...deletedIds);
    }
  }

  const files = req.files as Express.Multer.File[] | undefined;
  const fileList = files || [];

  if (body.imageOrder) {
    const order = JSON.parse(body.imageOrder) as ImageOrderItem[];
    const updateSortOrder = db.prepare('UPDATE trip_images SET sort_order = ? WHERE id = ? AND record_id = ?');
    const insertImage = db.prepare('INSERT INTO trip_images (record_id, filename, original_name, sort_order) VALUES (?, ?, ?, ?)');
    let fileIndex = 0;

    order.forEach((item, sortOrder) => {
      if (item.id !== undefined) {
        updateSortOrder.run(sortOrder, item.id, Number(id));
      } else if (item.tempId !== undefined && fileIndex < fileList.length) {
        const file = fileList[fileIndex];
        insertImage.run(Number(id), file.filename, file.originalname, sortOrder);
        fileIndex++;
      }
    });
  } else if (fileList.length > 0) {
    const maxOrderRow = db.prepare('SELECT COALESCE(MAX(sort_order), -1) as max_order FROM trip_images WHERE record_id = ?').get(id) as { max_order: number };
    let sortOrder = maxOrderRow.max_order + 1;
    
    const insertImage = db.prepare('INSERT INTO trip_images (record_id, filename, original_name, sort_order) VALUES (?, ?, ?, ?)');
    fileList.forEach((file) => {
      insertImage.run(Number(id), file.filename, file.originalname, sortOrder++);
    });
  }

  res.json({ id: Number(id), message: '更新成功' });
});

router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const existing = db.prepare('SELECT id FROM trip_records WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: '记录不存在' });
  }

  const images = db.prepare('SELECT filename FROM trip_images WHERE record_id = ?').all(id) as { filename: string }[];
  images.forEach(img => {
    const filePath = path.join(uploadDir, img.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  db.prepare('DELETE FROM trip_records WHERE id = ?').run(id);
  res.json({ message: '删除成功' });
});

export default router;
