import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, Train, MapPin, Calendar, Clock,
  DollarSign, AlertCircle, CheckCircle, FileText, Image as ImageIcon,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { api } from '@/utils/api';
import { TripRecord } from '@shared/types';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';

export default function RecordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<TripRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  useEffect(() => {
    if (!id) return;
    fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await api.getRecord(Number(id));
      setRecord(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '加载失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await api.deleteRecord(Number(id));
      showToast('删除成功', 'success');
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '删除失败', 'error');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  };

  const getTrainTypeColor = (type: string) => {
    switch (type) {
      case '复兴号': return 'bg-red-100 text-red-700';
      case '和谐号': return 'bg-blue-100 text-blue-700';
      case '绿皮车': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex === null || !record?.images) return;
    const total = record.images.length;
    setCurrentImageIndex((currentImageIndex - 1 + total) % total);
  };

  const handleNextImage = () => {
    if (currentImageIndex === null || !record?.images) return;
    const total = record.images.length;
    setCurrentImageIndex((currentImageIndex + 1) % total);
  };

  if (isLoading) {
    return (
      <div className="card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cream-100 rounded w-1/4"></div>
          <div className="h-64 bg-cream-100 rounded"></div>
          <div className="h-8 bg-cream-100 rounded w-1/3"></div>
          <div className="h-4 bg-cream-100 rounded w-2/3"></div>
          <div className="h-4 bg-cream-100 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="card p-8 text-center">
        <Train className="w-16 h-16 text-cream-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">记录不存在</p>
        <Link to="/" className="btn-primary">返回列表</Link>
      </div>
    );
  }

  const images = record.images || [];

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
        <div className="flex-1"></div>
        <Link
          to={`/edit/${record.id}`}
          className="btn-secondary flex items-center gap-2 px-4 py-2"
        >
          <Edit2 className="w-4 h-4" />
          编辑
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="btn-danger flex items-center gap-2 px-4 py-2"
        >
          <Trash2 className="w-4 h-4" />
          删除
        </button>
      </div>

      <div className="card overflow-hidden">
        {images.length > 0 && (
          <div className="relative">
            <img
              src={images[0].url}
              alt={record.trainNumber}
              className="w-full h-72 md:h-96 object-cover cursor-pointer"
              onClick={() => setCurrentImageIndex(0)}
            />
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                1 / {images.length}
              </div>
            )}
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Train className="w-7 h-7 text-primary-600" />
              <span className="text-3xl font-bold text-primary-600 font-serif">{record.trainNumber}</span>
            </div>
            <span className={`badge ${getTrainTypeColor(record.trainType)} text-base px-3 py-1`}>
              {record.trainType}
            </span>
            {record.isDelayed ? (
              <span className="badge bg-orange-100 text-orange-700 flex items-center gap-1 text-base px-3 py-1">
                <AlertCircle className="w-4 h-4" />
                晚点 {record.delayMinutes} 分钟
              </span>
            ) : (
              <span className="badge bg-green-100 text-green-700 flex items-center gap-1 text-base px-3 py-1">
                <CheckCircle className="w-4 h-4" />
                准点运行
              </span>
            )}
          </div>

          <div className="bg-cream-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MapPin className="w-5 h-5 text-accent-500" />
                  <span className="text-2xl font-bold text-gray-800">{record.departureStation}</span>
                </div>
                <p className="text-3xl font-bold text-primary-600">{record.scheduledDeparture}</p>
                <p className="text-sm text-gray-500">计划出发</p>
              </div>
              <div className="flex items-center gap-2 px-4">
                <div className="w-16 h-0.5 bg-primary-300 rounded"></div>
                <Train className="w-6 h-6 text-primary-500" />
                <div className="w-16 h-0.5 bg-primary-300 rounded"></div>
              </div>
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-2xl font-bold text-gray-800">{record.arrivalStation}</span>
                  <MapPin className="w-5 h-5 text-accent-500" />
                </div>
                <p className="text-3xl font-bold text-primary-600">{record.actualArrival}</p>
                <p className="text-sm text-gray-500">实际到达</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-cream-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">乘车日期</span>
              </div>
              <p className="font-semibold text-gray-800">{formatDate(record.tripDate)}</p>
            </div>
            <div className="bg-cream-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">历时</span>
              </div>
              <p className="font-semibold text-gray-800">
                {(() => {
                  const [h1, m1] = record.scheduledDeparture.split(':').map(Number);
                  const [h2, m2] = record.actualArrival.split(':').map(Number);
                  let minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
                  if (minutes < 0) minutes += 24 * 60;
                  const h = Math.floor(minutes / 60);
                  const m = minutes % 60;
                  return `${h}小时${m}分钟`;
                })()}
              </p>
            </div>
            <div className="bg-cream-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">票价</span>
              </div>
              <p className="font-semibold text-accent-600">¥{record.ticketPrice}</p>
            </div>
            <div className="bg-cream-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Train className="w-4 h-4" />
                <span className="text-sm">座位类型</span>
              </div>
              <p className="font-semibold text-gray-800">{record.seatType}</p>
            </div>
          </div>

          {images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary-600" />
                旅行照片 ({images.length})
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative"
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={img.url}
                      alt={img.originalName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {record.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                旅途心得
              </h3>
              <div className="bg-cream-50 rounded-xl p-5">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{record.notes}</p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-cream-200 text-sm text-gray-400 flex justify-between">
            <span>创建时间：{new Date(record.createdAt).toLocaleString('zh-CN')}</span>
            <span>更新时间：{new Date(record.updatedAt).toLocaleString('zh-CN')}</span>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="确认删除"
        message="确定要删除这条旅行记录吗？此操作不可撤销，相关照片也将被删除。"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {currentImageIndex !== null && images.length > 0 && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setCurrentImageIndex(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(null); }}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
            className="absolute left-4 text-white/80 hover:text-white transition-colors p-2"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <img
            src={images[currentImageIndex].url}
            alt={images[currentImageIndex].originalName}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
            className="absolute right-4 text-white/80 hover:text-white transition-colors p-2"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          <div className="absolute bottom-4 text-white/80 text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
