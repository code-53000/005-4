import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Train } from 'lucide-react';
import { api } from '@/utils/api';
import { TripRecordFormData, TripImage, TRAIN_TYPES, SEAT_TYPES, TrainType, SeatType, ImageOrderItem } from '@shared/types';
import ImageUploader from '@/components/ImageUploader';
import Toast from '@/components/Toast';

export default function RecordForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<TripRecordFormData>({
    trainNumber: '',
    trainType: '复兴号',
    departureStation: '',
    arrivalStation: '',
    tripDate: '',
    scheduledDeparture: '',
    actualArrival: '',
    isDelayed: false,
    delayMinutes: 0,
    seatType: '二等座',
    ticketPrice: 0,
    notes: '',
  });

  const [existingImages, setExistingImages] = useState<TripImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [imageOrder, setImageOrder] = useState<ImageOrderItem[]>([]);
  const [orderedNewFiles, setOrderedNewFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchRecord();
    }
  }, [isEdit, id]);

  const fetchRecord = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await api.getRecord(Number(id));
      setFormData({
        trainNumber: data.trainNumber,
        trainType: data.trainType,
        departureStation: data.departureStation,
        arrivalStation: data.arrivalStation,
        tripDate: data.tripDate,
        scheduledDeparture: data.scheduledDeparture,
        actualArrival: data.actualArrival,
        isDelayed: data.isDelayed,
        delayMinutes: data.delayMinutes,
        seatType: data.seatType,
        ticketPrice: data.ticketPrice,
        notes: data.notes || '',
      });
      setExistingImages(data.images || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '加载失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.trainNumber.trim()) newErrors.trainNumber = '请输入车次号';
    if (!formData.departureStation.trim()) newErrors.departureStation = '请输入出发站';
    if (!formData.arrivalStation.trim()) newErrors.arrivalStation = '请输入到达站';
    if (!formData.tripDate) newErrors.tripDate = '请选择日期';
    if (!formData.scheduledDeparture) newErrors.scheduledDeparture = '请选择计划出发时间';
    if (!formData.actualArrival) newErrors.actualArrival = '请选择实际到达时间';
    if (formData.ticketPrice < 0) newErrors.ticketPrice = '票价不能为负数';
    if (formData.isDelayed && formData.delayMinutes <= 0) {
      newErrors.delayMinutes = '请输入晚点分钟数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'isDelayed') {
          formPayload.append(key, value ? 'true' : 'false');
        } else if (key === 'ticketPrice' || key === 'delayMinutes') {
          formPayload.append(key, String(value));
        } else {
          formPayload.append(key, String(value));
        }
      });

      if (deletedImageIds.length > 0) {
        formPayload.append('deletedImages', JSON.stringify(deletedImageIds));
      }

      if (isEdit && imageOrder.length > 0) {
        formPayload.append('imageOrder', JSON.stringify(imageOrder));
      }

      const filesToUpload = orderedNewFiles.length > 0 ? orderedNewFiles : newFiles;
      filesToUpload.forEach(file => {
        formPayload.append('images', file);
      });

      if (isEdit) {
        await api.updateRecord(Number(id), formPayload);
        showToast('更新成功', 'success');
      } else {
        const result = await api.createRecord(formPayload);
        showToast('创建成功', 'success');
        setTimeout(() => navigate(`/record/${result.id}`), 500);
        return;
      }

      setTimeout(() => navigate(-1), 500);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '保存失败', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof TripRecordFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleDeleteExistingImage = (imageId: number) => {
    setDeletedImageIds(prev => [...prev, imageId]);
  };

  if (isLoading) {
    return (
      <div className="card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cream-100 rounded w-1/4 mb-6"></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-cream-100 rounded"></div>
              <div className="h-10 bg-cream-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">
          {isEdit ? '编辑旅行记录' : '新增旅行记录'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 md:p-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <Train className="w-5 h-5 text-primary-600" />
              车次信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">车次号 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.trainNumber}
                  onChange={(e) => handleInputChange('trainNumber', e.target.value)}
                  placeholder="如：G1234"
                  className={`input-field ${errors.trainNumber ? 'input-error' : ''}`}
                />
                {errors.trainNumber && <p className="text-red-500 text-sm mt-1">{errors.trainNumber}</p>}
              </div>
              <div>
                <label className="label">列车型号 <span className="text-red-500">*</span></label>
                <select
                  value={formData.trainType}
                  onChange={(e) => handleInputChange('trainType', e.target.value as TrainType)}
                  className="input-field"
                >
                  {TRAIN_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">行程信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">出发站 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.departureStation}
                  onChange={(e) => handleInputChange('departureStation', e.target.value)}
                  placeholder="如：北京南站"
                  className={`input-field ${errors.departureStation ? 'input-error' : ''}`}
                />
                {errors.departureStation && <p className="text-red-500 text-sm mt-1">{errors.departureStation}</p>}
              </div>
              <div>
                <label className="label">到达站 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.arrivalStation}
                  onChange={(e) => handleInputChange('arrivalStation', e.target.value)}
                  placeholder="如：上海虹桥站"
                  className={`input-field ${errors.arrivalStation ? 'input-error' : ''}`}
                />
                {errors.arrivalStation && <p className="text-red-500 text-sm mt-1">{errors.arrivalStation}</p>}
              </div>
              <div>
                <label className="label">日期 <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={formData.tripDate}
                  onChange={(e) => handleInputChange('tripDate', e.target.value)}
                  className={`input-field ${errors.tripDate ? 'input-error' : ''}`}
                />
                {errors.tripDate && <p className="text-red-500 text-sm mt-1">{errors.tripDate}</p>}
              </div>
              <div>
                <label className="label">计划出发时间 <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  value={formData.scheduledDeparture}
                  onChange={(e) => handleInputChange('scheduledDeparture', e.target.value)}
                  className={`input-field ${errors.scheduledDeparture ? 'input-error' : ''}`}
                />
                {errors.scheduledDeparture && <p className="text-red-500 text-sm mt-1">{errors.scheduledDeparture}</p>}
              </div>
              <div>
                <label className="label">实际到达时间 <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  value={formData.actualArrival}
                  onChange={(e) => handleInputChange('actualArrival', e.target.value)}
                  className={`input-field ${errors.actualArrival ? 'input-error' : ''}`}
                />
                {errors.actualArrival && <p className="text-red-500 text-sm mt-1">{errors.actualArrival}</p>}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDelayed}
                  onChange={(e) => handleInputChange('isDelayed', e.target.checked)}
                  className="w-5 h-5 rounded border-cream-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">是否晚点</span>
              </label>
              {formData.isDelayed && (
                <div className="w-32">
                  <label className="label">晚点分钟数</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.delayMinutes}
                    onChange={(e) => handleInputChange('delayMinutes', parseInt(e.target.value) || 0)}
                    className={`input-field ${errors.delayMinutes ? 'input-error' : ''}`}
                  />
                  {errors.delayMinutes && <p className="text-red-500 text-sm mt-1">{errors.delayMinutes}</p>}
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">票务信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">座位类型 <span className="text-red-500">*</span></label>
                <select
                  value={formData.seatType}
                  onChange={(e) => handleInputChange('seatType', e.target.value as SeatType)}
                  className="input-field"
                >
                  {SEAT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">票价 (元) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.ticketPrice}
                  onChange={(e) => handleInputChange('ticketPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={`input-field ${errors.ticketPrice ? 'input-error' : ''}`}
                />
                {errors.ticketPrice && <p className="text-red-500 text-sm mt-1">{errors.ticketPrice}</p>}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">旅行照片</h2>
            <ImageUploader
              existingImages={existingImages}
              newFiles={newFiles}
              deletedImageIds={deletedImageIds}
              onNewFilesChange={setNewFiles}
              onDeleteExisting={handleDeleteExistingImage}
              onOrderChange={setImageOrder}
              onNewFilesReordered={setOrderedNewFiles}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">旅途心得</h2>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="记录这次旅行的感受、见闻、趣事..."
              rows={6}
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-cream-200">
          <Link
            to=".."
            className="btn-secondary"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '保存中...' : (isEdit ? '保存修改' : '创建记录')}
          </button>
        </div>
      </form>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
