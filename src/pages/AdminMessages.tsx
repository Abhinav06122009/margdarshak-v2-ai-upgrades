import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Trash2, Mail, User, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  message: string;
  status: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch messages on load
  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMessages(prev => prev.filter(msg => msg.id !== id));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Inbox ({messages.length})
          </h1>
          <Link to="/dashboard">
            <Button variant="outline" className="border-white/20 text-gray-300">Back to Dashboard</Button>
          </Link>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No messages yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <Card key={msg.id} className="bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-emerald-400 font-bold">
                        {msg.first_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">
                          {msg.first_name} {msg.last_name}
                        </CardTitle>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {msg.email}</span>
                          <span className="text-gray-600">•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(msg.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-500 hover:text-red-400 hover:bg-red-900/10"
                      onClick={() => handleDelete(msg.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/30 p-4 rounded-lg text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
