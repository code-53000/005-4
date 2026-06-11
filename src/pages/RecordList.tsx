import { useState, useEffect } from 'react';
import { Search, RotateCcw, Train } from 'lucide-react';
import { api } from '@/utils/api';
import { TripRecord } from '@shared/types';
import RecordCard from '@/components/RecordCard';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';

export default function RecordList() {
  const [records, setRecords] = useState<TripRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trainNumber, setTrainNumber] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  const fetchRecords = async (filters?: { trainNumber?: string; dateFrom?: string; dateTo?: string }) => {
    setIsLoading(true);
    try {
      const source = filters ?? { trainNumber, dateFrom, dateTo };
      const params: { trainNumber?: string; dateFrom?: string; dateTo?: string } = {};
      if (source.trainNumber?.trim()) params.trainNumber = source.trainNumber.trim();
      if (source.dateFrom) params.dateFrom = source.dateFrom;
      if (source.dateTo) params.dateTo = source.dateTo;

      const data = await api.getRecords(params);
      setRecords(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '加载失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleReset = () => {
    setTrainNumber('');
    setDateFrom('');
    setDateTo('');
    fetchRecords({ trainNumber: '', dateFrom: '', dateTo: '' });
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteRecord(deleteId);
      setRecords(prev => prev.filter(r => r.id !== deleteId));
      showToast('删除成功', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '删除失败', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary-600" />
          搜索筛选
        </h2>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">车次号</label>
            <input
              type="text"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              placeholder="输入车次号"
              className="input-field"
            />
          </div>
          <div>
            <label className="label">开始日期</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">结束日期</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-primary flex-1">
              搜索
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary px-4"
              title="重置"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 font-serif">
          旅行记录
          <span className="ml-2 text-sm font-normal text-gray-500">
            共 {records.length} 条记录
          </span>
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card p-0 overflow-hidden">
              <div className="h-48 bg-cream-100 animate-pulse"></div>
              <div className="p-5 space-y-3">
                <div className="h-6 bg-cream-100 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-cream-100 rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-cream-100 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="card p-12 text-center">
          <Train className="w-16 h-16 text-cream-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">暂无旅行记录</p>
          <p className="text-gray-400 text-sm">点击右上角「新增记录」开始记录您的火车旅行吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map(record => (
            <RecordCard
              key={record.id}
              record={record}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        title="确认删除"
        message="确定要删除这条旅行记录吗？此操作不可撤销，相关照片也将被删除。"
        confirmText="删除"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
