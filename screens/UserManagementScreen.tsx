
import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/databaseService';
import type { User, Personnel } from '../types';

interface UserManagementScreenProps {
    onClose: () => void;
    onUpdate: () => void;
}

const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ onClose, onUpdate }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isNew, setIsNew] = useState(false);
    
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'user' as 'admin' | 'user',
        personnelId: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setUsers(DatabaseService.getUsers());
        setPersonnelList(DatabaseService.getPersonnel());
    };

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            password: '', // Don't show existing password
            role: user.role,
            personnelId: user.personnelId || ''
        });
        setIsNew(false);
    };

    const handleNewUser = () => {
        setSelectedUser(null);
        setFormData({
            username: '',
            password: '',
            role: 'user',
            personnelId: ''
        });
        setIsNew(true);
    };

    const handleSave = () => {
        if (!formData.username || (!formData.password && isNew)) {
            alert('Kullanıcı adı ve şifre alanları zorunludur.');
            return;
        }

        if (isNew) {
            DatabaseService.createUser({
                username: formData.username,
                password: formData.password,
                role: formData.role,
                personnelId: formData.personnelId || undefined
            });
            alert('Yeni kullanıcı oluşturuldu.');
        } else if (selectedUser) {
            const updatedUserData: Partial<User> = {
                username: formData.username,
                role: formData.role,
                personnelId: formData.personnelId || undefined
            };
            if(formData.password) {
                updatedUserData.password = formData.password;
            }
            DatabaseService.updateUser({ ...selectedUser, ...updatedUserData });
            alert('Kullanıcı güncellendi.');
        }
        
        loadData();
        onUpdate();
        handleNewUser();
    };

    const handleDelete = () => {
        if (selectedUser) {
            if (selectedUser.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
                alert('Son yönetici hesabı silinemez.');
                return;
            }
            if(window.confirm(`${selectedUser.username} kullanıcısını silmek istediğinizden emin misiniz?`)) {
                DatabaseService.deleteUser(selectedUser.id);
                alert('Kullanıcı silindi.');
                loadData();
                onUpdate();
                handleNewUser();
            }
        }
    };

    const inputStyle = "w-full bg-white border border-gray-400 px-1 py-0.5";

    return (
        <div className="mt-2 p-4 border bg-gray-200 shadow-inner">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Kullanıcı Yönetimi</h2>
                <button onClick={onClose} className="px-4 py-1 bg-red-500 text-white rounded shadow-sm hover:bg-red-600">Kapat</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 border-r pr-4">
                    <h3 className="font-semibold mb-2">Kullanıcı Listesi</h3>
                    <div className="h-96 overflow-y-auto bg-white border">
                        <ul>
                            {users.map(user => (
                                <li 
                                    key={user.id} 
                                    onClick={() => handleSelectUser(user)}
                                    className={`p-2 cursor-pointer hover:bg-blue-100 ${selectedUser?.id === user.id ? 'bg-blue-600 text-white' : ''}`}
                                >
                                    {user.username} ({user.role})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <h3 className="font-semibold mb-2">{isNew ? 'Yeni Kullanıcı Oluştur' : 'Kullanıcıyı Düzenle'}</h3>
                    <div className="space-y-4">
                         <div>
                            <label>Kullanıcı Adı</label>
                            <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className={inputStyle} />
                        </div>
                        <div>
                            <label>Şifre {isNew ? '' : '(Değiştirmek için doldurun)'}</label>
                            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputStyle} />
                        </div>
                        <div>
                            <label>Rol</label>
                            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as 'admin' | 'user'})} className={inputStyle}>
                                <option value="user">Çalışan</option>
                                <option value="admin">Yönetici</option>
                            </select>
                        </div>
                        <div>
                            <label>Bağlı Personel (Sadece Çalışan için)</label>
                            <select 
                                value={formData.personnelId} 
                                onChange={e => setFormData({...formData, personnelId: e.target.value})} 
                                className={inputStyle}
                                disabled={formData.role !== 'user'}
                            >
                                <option value="">Personel Seç</option>
                                {personnelList.map(p => <option key={p.id} value={p.id}>{p.adSoyad}</option>)}
                            </select>
                        </div>
                        <div className="flex space-x-2 pt-2">
                             <button onClick={handleNewUser} className="px-4 py-1 bg-gray-300 border border-gray-400 rounded shadow-sm hover:bg-gray-400">Yeni</button>
                             <button onClick={handleSave} className="px-4 py-1 bg-green-500 text-white border border-green-600 rounded shadow-sm hover:bg-green-600">Kaydet</button>
                             {selectedUser && <button onClick={handleDelete} className="px-4 py-1 bg-red-500 text-white border border-red-600 rounded shadow-sm hover:bg-red-600">Sil</button>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagementScreen;
