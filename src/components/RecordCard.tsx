import { Link } from 'react-router-dom';
import { Train, MapPin, Calendar, Clock, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { TripRecord } from '@shared/types';

interface RecordCardProps {
  record: TripRecord;
  onDelete: (id: number) => void;
}

export default function RecordCard({ record, onDelete }: RecordCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
  };

  const getTrainTypeColor = (type: string) => {
    switch (type) {
      case '复兴号': return 'bg-red-100 text-red-700';
      case '和谐号': return 'bg-blue-100 text-blue-700';
      case '绿皮车': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="card group animate-fade-in">
      {record.images && record.images.length > 0 && (
        <Link to={`/record/${record.id}`} className="block overflow-hidden">
          <img
            src={record.images[0].url}
            alt={record.trainNumber}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Train className="w-5 h-5 text-primary-600" />
            <span className="text-xl font-bold text-primary-600 font-serif">{record.trainNumber}</span>
            <span className={`badge ${getTrainTypeColor(record.trainType)}`}>
              {record.trainType}
            </span>
          </div>
          {record.isDelayed ? (
            <span className="badge bg-orange-100 text-orange-700 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              晚点 {record.delayMinutes} 分钟
            </span>
          ) : (
            <span className="badge bg-green-100 text-green-700 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              准点
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-1 text-gray-800 font-medium">
              <MapPin className="w-4 h-4 text-accent-500" />
              {record.departureStation}
            </div>
          </div>
          <div className="flex items-center gap-1 text-primary-500">
            <div className="w-8 h-0.5 bg-primary-300 rounded"></div>
            <Clock className="w-4 h-4" />
            <div className="w-8 h-0.5 bg-primary-300 rounded"></div>
          </div>
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-1 text-gray-800 font-medium">
              {record.arrivalStation}
              <MapPin className="w-4 h-4 text-accent-500" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(record.tripDate)}</span>
          <span className="text-gray-300">·</span>
          <span>{record.scheduledDeparture} - {record.actualArrival}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-accent-500" />
              <span className="font-semibold text-accent-600">¥{record.ticketPrice}</span>
            </div>
            <span className="badge bg-cream-100 text-cream-500">{record.seatType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/record/${record.id}`}
              className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              详情
            </Link>
            <Link
              to={`/edit/${record.id}`}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              编辑
            </Link>
            <button
              onClick={() => onDelete(record.id)}
              className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
