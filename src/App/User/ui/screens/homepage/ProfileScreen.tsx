import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  imageUrl: string;
  vip: boolean;
  rank: string;
  jlptLevel: number | null;
  studyMonths: number | null;
  activityPoints: number;
}

interface UserProgress {
  courseId: string;
  courseTitle: string;
  progress: number;
  passedExercises: string[];
  lastUpdated: number;
}

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedJlptLevel, setEditedJlptLevel] = useState<number | null>(null);
  const [editedStudyMonths, setEditedStudyMonths] = useState<number | null>(null);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showVipDialog, setShowVipDialog] = useState(false);

  useEffect(() => {
    // Mock data
    const mockUser: User = {
      id: '1',
      username: 'Học viên',
      email: 'user@example.com',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      vip: false,
      rank: 'Beginner',
      jlptLevel: 5,
      studyMonths: 6,
      activityPoints: 350
    };

    setUser(mockUser);
    setEditedUsername(mockUser.username);
    setEditedJlptLevel(mockUser.jlptLevel);
    setEditedStudyMonths(mockUser.studyMonths);

    setUserProgress([
      {
        courseId: '1',
        courseTitle: 'Hiragana Cơ Bản',
        progress: 0.65,
        passedExercises: ['1', '2', '3'],
        lastUpdated: Date.now()
      }
    ]);
  }, []);

  const handleSave = () => {
    if (user && editedUsername) {
      setUser({
        ...user,
        username: editedUsername,
        jlptLevel: editedJlptLevel,
        studyMonths: editedStudyMonths
      });
      setIsEditMode(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditedUsername(user.username);
      setEditedJlptLevel(user.jlptLevel);
      setEditedStudyMonths(user.studyMonths);
    }
    setIsEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium">👋 こんにちわ {user?.username} さん</h1>
            {user?.vip && <p className="text-sm text-yellow-600">⭐ VIP です!</p>}
          </div>
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✓
                </button>
              </>
            ) : (
              <>
                <button className="p-2 hover:bg-gray-100 rounded-full">👥</button>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✏️
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Image */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={user?.imageUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full shadow-lg"
            />
            {isEditMode && (
              <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full shadow-lg">
                ✏️
              </button>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          {isEditMode ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">JLPT Level</label>
                <select
                  value={editedJlptLevel || ''}
                  onChange={(e) => setEditedJlptLevel(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">None</option>
                  {[5, 4, 3, 2, 1].map(level => (
                    <option key={level} value={level}>N{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Months of Study</label>
                <input
                  type="number"
                  value={editedStudyMonths || ''}
                  onChange={(e) => setEditedStudyMonths(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter months"
                />
              </div>
            </>
          ) : (
            <>
              <InfoRow label="Username" value={user?.username} icon="👤" />
              <InfoRow label="JLPT Level" value={user?.jlptLevel ? `N${user.jlptLevel}` : 'Not set'} icon="⭐" />
              <InfoRow label="Months of Study" value={user?.studyMonths?.toString() || 'Not set'} icon="✓" />
              <InfoRow label="Activity Points" value={user?.activityPoints.toString()} icon="🏆" />
              <InfoRow
                label="VIP Status"
                value={user?.vip ? '⭐ VIP' : 'Standard'}
                icon="💎"
                valueColor={user?.vip ? 'text-yellow-600' : 'text-gray-600'}
              />
            </>
          )}
        </div>

        {/* Progress */}
        <div>
          <h2 className="text-xl font-bold mb-4">Your Progress</h2>
          {userProgress.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-500 mb-4">You haven't joined any courses yet</p>
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userProgress.map(progress => (
                <div key={progress.courseId} className="bg-white rounded-xl shadow-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold">{progress.courseTitle}</h3>
                    <span className="text-green-600 font-bold">{Math.round(progress.progress * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress.progress * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <span>{progress.passedExercises.length} exercises completed</span>
                    <span>Last updated: {new Date(progress.lastUpdated).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Continue
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => setShowSignOutDialog(true)}
            className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
          >
            Sign Out
          </button>

          {!user?.vip && (
            <button
              onClick={() => setShowVipDialog(true)}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg"
            >
              ⭐ Nâng cấp lên VIP
            </button>
          )}
        </div>
      </main>

      {/* Sign Out Dialog */}
      {showSignOutDialog && (
        <Dialog
          title="Sign Out"
          message="Are you sure you want to sign out?"
          onConfirm={() => console.log('Sign out')}
          onCancel={() => setShowSignOutDialog(false)}
        />
      )}

      {/* VIP Dialog */}
      {showVipDialog && (
        <VipDialog onClose={() => setShowVipDialog(false)} />
      )}
    </div>
  );
};

const InfoRow: React.FC<{
  label: string;
  value?: string;
  icon: string;
  valueColor?: string;
}> = ({ label, value, icon, valueColor = 'text-gray-900' }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{label}</div>
        <div className={`font-medium ${valueColor}`}>{value}</div>
      </div>
    </div>
  );
};

const Dialog: React.FC<{
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6">
        <h2 className="text-xl font-bold mb-3">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const VipDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 my-8">
        <h2 className="text-2xl font-bold mb-4">Nâng cấp lên VIP</h2>

        <div className="bg-gradient-to-r from-blue-900 to-blue-600 rounded-xl p-6 text-white text-center mb-6">
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-xl font-bold">Gói VIP Premium</div>
          <div className="text-yellow-300 font-bold">100.000 VNĐ / tháng</div>
        </div>

        <div className="space-y-3 mb-6">
          <h3 className="font-bold">Quyền lợi thành viên VIP:</h3>
          <BenefitItem text="Truy cập tất cả khóa học VIP" />
          <BenefitItem text="Không giới hạn bài tập và flashcards" />
          <BenefitItem text="Ưu tiên hỗ trợ từ đội ngũ giáo viên" />
          <BenefitItem text="Huy hiệu VIP độc quyền trên hồ sơ" />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};

const BenefitItem: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-green-600">✓</span>
      <span className="text-sm">{text}</span>
    </div>
  );
};

export default ProfileScreen;