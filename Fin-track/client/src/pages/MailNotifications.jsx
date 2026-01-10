import { useEffect, useState } from "react";

export default function MailNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchMails = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data);
      
      // Mark as read after viewing
      fetch("http://localhost:5000/api/notifications/read", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
    };
    fetchMails();
  }, []);

  return (
    <div className="p-8 text-white max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Alert Center</h2>
      <div className="space-y-4">
        {notifications.map(n => (
          <div key={n._id} className={`p-4 rounded-xl border ${n.isRead ? 'bg-gray-800 border-gray-700' : 'bg-blue-900/20 border-blue-500'}`}>
            <p className="text-sm">{n.message}</p>
            <span className="text-[10px] text-gray-500 uppercase">{new Date(n.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}