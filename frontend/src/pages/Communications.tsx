
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Bell, Users, Megaphone, Plus, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  recipientName?: string;
  recipientType: 'individual' | 'group' | 'broadcast';
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  attachments?: string[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  targetAudience: 'all' | 'teachers' | 'students' | 'parents' | 'grade-specific';
  targetGrade?: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  isActive: boolean;
  expiryDate?: string;
}

interface Notification {
  id: string;
  type: 'message' | 'announcement' | 'reminder' | 'alert';
  title: string;
  content: string;
  recipientId: string;
  timestamp: string;
  isRead: boolean;
  actionRequired?: boolean;
}

export const Communications = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'message' | 'announcement'>('message');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: 'teacher1',
        senderName: 'John Smith',
        senderRole: 'teacher',
        recipientId: user?.id || '1',
        recipientName: user?.firstName + ' ' + user?.lastName || 'Admin',
        recipientType: 'individual',
        subject: 'Grade 10 Mathematics Test Results',
        content: 'Please find attached the test results for Grade 10 Mathematics. Overall performance was good with an average of 78%.',
        timestamp: '2024-01-08T10:30:00Z',
        isRead: false,
        priority: 'medium',
      },
      {
        id: '2',
        senderId: 'parent1',
        senderName: 'Jane Doe',
        senderRole: 'parent',
        recipientId: user?.id || '1',
        recipientName: user?.firstName + ' ' + user?.lastName || 'Admin',
        recipientType: 'individual',
        subject: 'Absence Notice',
        content: 'My child Alice will be absent tomorrow due to a medical appointment. Please excuse her absence.',
        timestamp: '2024-01-07T14:20:00Z',
        isRead: true,
        priority: 'low',
      },
    ];

    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        title: 'School Holiday Notice',
        content: 'The school will be closed on January 19th for Ethiopian Timkat celebration. Classes will resume on January 22nd.',
        authorId: user?.id || '1',
        authorName: user?.firstName + ' ' + user?.lastName || 'Admin',
        targetAudience: 'all',
        priority: 'high',
        timestamp: '2024-01-06T09:00:00Z',
        isActive: true,
        expiryDate: '2024-01-22T00:00:00Z',
      },
      {
        id: '2',
        title: 'Parent-Teacher Conference',
        content: 'Individual parent-teacher conferences are scheduled for next week. Please contact your child\'s teachers to schedule appointments.',
        authorId: user?.id || '1',
        authorName: user?.firstName + ' ' + user?.lastName || 'Admin',
        targetAudience: 'parents',
        priority: 'medium',
        timestamp: '2024-01-05T16:30:00Z',
        isActive: true,
      },
    ];

    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'reminder',
        title: 'Assignment Due Tomorrow',
        content: 'Mathematics homework for Grade 10 is due tomorrow',
        recipientId: user?.id || '1',
        timestamp: '2024-01-08T18:00:00Z',
        isRead: false,
        actionRequired: true,
      },
      {
        id: '2',
        type: 'alert',
        title: 'New Message Received',
        content: 'You have received a new message from John Smith',
        recipientId: user?.id || '1',
        timestamp: '2024-01-08T10:30:00Z',
        isRead: false,
      },
    ];

    setMessages(mockMessages);
    setAnnouncements(mockAnnouncements);
    setNotifications(mockNotifications);
  }, [user]);

  const filteredMessages = messages.filter(message => {
    const searchMatch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       message.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeMatch = filterType === 'all' || 
                     (filterType === 'unread' && !message.isRead) ||
                     (filterType === 'sent' && message.senderId === user?.id) ||
                     (filterType === 'received' && message.recipientId === user?.id);
    
    return searchMatch && typeMatch;
  });

  const handleCreateMessage = () => {
    setDialogType('message');
    setIsDialogOpen(true);
  };

  const handleCreateAnnouncement = () => {
    setDialogType('announcement');
    setIsDialogOpen(true);
  };

  const handleSendMessage = (messageData: Partial<Message>) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '1',
      senderName: user?.firstName + ' ' + user?.lastName || 'User',
      senderRole: user?.role || 'admin',
      recipientType: 'individual',
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: 'medium',
      ...messageData as Message,
    };
    
    setMessages([newMessage, ...messages]);
    setIsDialogOpen(false);
    toast.success('Message sent successfully');
  };

  const handleCreateAnnouncementSubmit = (announcementData: Partial<Announcement>) => {
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      authorId: user?.id || '1',
      authorName: user?.firstName + ' ' + user?.lastName || 'User',
      timestamp: new Date().toISOString(),
      isActive: true,
      priority: 'medium',
      ...announcementData as Announcement,
    };
    
    setAnnouncements([newAnnouncement, ...announcements]);
    setIsDialogOpen(false);
    toast.success('Announcement published successfully');
  };

  const markAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 3600));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600">Messages, announcements, and notifications</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleCreateMessage} variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            New Message
          </Button>
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <Button onClick={handleCreateAnnouncement}>
              <Megaphone className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            {filteredMessages.map((message) => (
              <Card 
                key={message.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  !message.isRead ? 'border-blue-200 bg-blue-50' : ''
                }`}
                onClick={() => markAsRead(message.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {message.senderName.split(' ').map(n => n.charAt(0)).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{message.senderName}</p>
                          <p className="text-xs text-gray-500 capitalize">{message.senderRole}</p>
                        </div>
                      </div>
                      <h3 className={`font-medium ${!message.isRead ? 'font-bold' : ''}`}>
                        {message.subject}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {message.content}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(message.timestamp)}
                      </span>
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                      {!message.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Megaphone className="w-5 h-5" />
                        <span>{announcement.title}</span>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        By {announcement.authorName} • {getTimeAgo(announcement.timestamp)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {announcement.priority}
                      </Badge>
                      <Badge variant="outline">
                        {announcement.targetAudience}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{announcement.content}</p>
                  {announcement.expiryDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Expires: {new Date(announcement.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  !notification.isRead ? 'border-orange-200 bg-orange-50' : ''
                }`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Bell className={`w-5 h-5 mt-0.5 ${
                        notification.type === 'alert' ? 'text-red-500' :
                        notification.type === 'reminder' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <div>
                        <h3 className={`font-medium ${!notification.isRead ? 'font-bold' : ''}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.content}
                        </p>
                        {notification.actionRequired && (
                          <Badge className="mt-2 bg-orange-100 text-orange-800">
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(notification.timestamp)}
                      </span>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <CommunicationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        type={dialogType}
        onSendMessage={handleSendMessage}
        onCreateAnnouncement={handleCreateAnnouncementSubmit}
      />
    </div>
  );
};

interface CommunicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'message' | 'announcement';
  onSendMessage: (data: Partial<Message>) => void;
  onCreateAnnouncement: (data: Partial<Announcement>) => void;
}

const CommunicationDialog = ({ 
  isOpen, 
  onClose, 
  type, 
  onSendMessage, 
  onCreateAnnouncement 
}: CommunicationDialogProps) => {
  const [formData, setFormData] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'message') {
      onSendMessage(formData);
    } else {
      onCreateAnnouncement(formData);
    }
    
    setFormData({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {type === 'message' ? 'Send New Message' : 'Create Announcement'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'message' ? (
            <>
              <div>
                <Label htmlFor="recipientName">Recipient</Label>
                <Input
                  id="recipientName"
                  placeholder="Enter recipient name or email"
                  value={formData.recipientName || ''}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Message</Label>
                <Textarea
                  id="content"
                  rows={6}
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority || 'medium'}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="title">Announcement Title</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  rows={6}
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select
                  value={formData.targetAudience || 'all'}
                  onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="teachers">Teachers Only</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="parents">Parents Only</SelectItem>
                    <SelectItem value="grade-specific">Specific Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority || 'medium'}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate ? formData.expiryDate.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value ? e.target.value + 'T00:00:00Z' : undefined })}
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Send className="w-4 h-4 mr-2" />
              {type === 'message' ? 'Send Message' : 'Publish Announcement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
