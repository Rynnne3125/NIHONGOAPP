import React, { useState, useEffect } from 'react';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  imageUrl: string;
  online: boolean;
  vip: boolean;
  rank: string;
  activityPoints: number;
}

interface StudyGroup {
  id: string;
  title: string;
  description: string;
  memberCount: number;
}

const CommunityScreenFull: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const tabs = ['Cộng đồng', 'Thảo luận', 'Bảng xếp hạng'];

  // Mock users
  const users: User[] = Array.from({ length: 10 }, (_, i) => ({
    id: `user-${i}`,
    username: `User ${i + 1}`,
    email: `user${i}@example.com`,
    imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    online: Math.random() > 0.5,
    vip: Math.random() > 0.7,
    rank: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
    activityPoints: Math.floor(Math.random() * 1000)
  }));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const onlineUsers = users.filter(u => u.online);
  const sortedUsers = [...users].sort((a, b) => b.activityPoints - a.activityPoints);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">👥 Community</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 flex gap-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setSelectedTab(index)}
              className={`py-4 px-2 border-b-2 font-medium ${
                selectedTab === index
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Real-time clock */}
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500 mb-1">🕐 Đang hoạt động</div>
          <div className="text-lg font-semibold text-green-600">
            {currentTime.toLocaleTimeString('vi-VN')}
          </div>
        </div>

        {selectedTab === 0 && (
          <div className="space-y-6">
            {/* Online Users */}
            <div>
              <h2 className="text-lg font-bold mb-4">Người dùng đang online</h2>
              {onlineUsers.length === 0 ? (
                <p className="text-gray-500">Không có người dùng nào đang hoạt động</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {onlineUsers.map(user => (
                    <div key={user.id} className="flex flex-col items-center gap-2 min-w-[80px]">
                      <div className="relative">
                        <img
                          src={user.imageUrl}
                          alt={user.username}
                          className="w-16 h-16 rounded-full"
                        />
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      </div>
                      <span className="text-sm text-center truncate w-full">{user.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Study Partners */}
            <div>
              <h2 className="text-lg font-bold mb-4">Đối tác học tập</h2>
              <div className="space-y-3">
                {users.slice(0, 5).map(user => (
                  <div key={user.id} className="bg-white rounded-lg p-4 shadow">
                    <div className="flex items-center gap-3">
                      <img src={user.imageUrl} alt={user.username} className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.username}</h3>
                          {user.vip && <span className="text-yellow-500">⭐</span>}
                        </div>
                        <p className="text-sm text-gray-600">{user.rank}</p>
                      </div>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700">
                        Kết nối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-2">Bảng xếp hạng tuần này</h2>
              <p className="text-sm text-gray-600">Dựa trên các điểm học tập</p>
            </div>

            {/* Top 3 */}
            <div className="flex justify-center items-end gap-4 mb-6">
              {sortedUsers[1] && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-xl">
                    #2
                  </div>
                  <img src={sortedUsers[1].imageUrl} alt="" className="w-14 h-14 rounded-full" />
                  <h3 className="font-bold">{sortedUsers[1].username}</h3>
                  <p className="text-sm text-green-600 font-bold">{sortedUsers[1].activityPoints} điểm</p>
                </div>
              )}
              {sortedUsers[0] && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-xl">
                    #1
                  </div>
                  <img src={sortedUsers[0].imageUrl} alt="" className="w-14 h-14 rounded-full" />
                  <h3 className="font-bold">{sortedUsers[0].username}</h3>
                  <p className="text-sm text-green-600 font-bold">{sortedUsers[0].activityPoints} điểm</p>
                </div>
              )}
              {sortedUsers[2] && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-xl">
                    #3
                  </div>
                  <img src={sortedUsers[2].imageUrl} alt="" className="w-14 h-14 rounded-full" />
                  <h3 className="font-bold">{sortedUsers[2].username}</h3>
                  <p className="text-sm text-green-600 font-bold">{sortedUsers[2].activityPoints} điểm</p>
                </div>
              )}
            </div>

            {/* Rest */}
            <div className="space-y-2">
              {sortedUsers.slice(3).map((user, index) => (
                <div key={user.id} className="bg-white rounded-lg p-4 shadow flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                    #{index + 4}
                  </div>
                  <img src={user.imageUrl} alt="" className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.username}</h3>
                    <p className="text-sm text-gray-500">{user.activityPoints} điểm</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CommunityScreenFull;