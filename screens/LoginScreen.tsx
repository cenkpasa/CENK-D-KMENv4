
import React, { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { DatabaseService } from '../services/databaseService';

const LoginScreen: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [sgkNo, setSgkNo] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AppContext);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const user = DatabaseService.findUser(username);
        
        if (!user || user.password !== password) {
            setError('Geçersiz kullanıcı adı veya şifre.');
            DatabaseService.logAction('Anonymous', 'LOGIN', 'Failed Login', `Attempted username: ${username}`);
            return;
        }

        if (user.role === 'admin') {
            DatabaseService.logAction(user.username, 'LOGIN', 'System', 'Admin Login Success');
            login(user);
        } else {
            if (!user.personnelId) {
                setError('Bu kullanıcı hesabı bir personel kartı ile ilişkilendirilmemiş.');
                return;
            }

            const personnel = DatabaseService.getPersonnelById(user.personnelId);

            if (!personnel) {
                setError('İlişkili personel kaydı veritabanında bulunamadı.');
                return;
            }

            if (personnel.sgkNo !== sgkNo) {
                setError('Girdiğiniz SGK Numarası sistemdeki kayıtlarla eşleşmiyor.');
                DatabaseService.logAction(username, 'LOGIN', 'Failed Login', 'SGK Mismatch');
                return;
            }

            DatabaseService.logAction(user.username, 'LOGIN', 'System', 'User Login Success');
            login(user);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
            {/* Abstract shapes for background */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="bg-[#1e293b] w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-700 z-10">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white tracking-tight">CNK Portal</h2>
                        <p className="text-slate-400 text-sm mt-2">Personel Yönetim ve Takip Sistemi</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Kullanıcı Adı</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-[#0f172a] border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                placeholder="Kullanıcı adınız"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Şifre</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-[#0f172a] border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                SGK No <span className="text-[10px] normal-case font-normal text-slate-500">(Personel Girişi İçin)</span>
                            </label>
                            <input
                                type="text"
                                value={sgkNo}
                                onChange={(e) => setSgkNo(e.target.value)}
                                className="w-full px-4 py-3 bg-[#0f172a] border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                placeholder="Doğrulama No"
                            />
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-rose-400 bg-rose-900/20 border border-rose-900/50 rounded-lg flex items-center">
                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-lg shadow-teal-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-all"
                        >
                            GÜVENLİ GİRİŞ
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-700 text-center">
                        <div className="text-xs text-slate-500 space-y-1">
                            <p>Demo Admin: admin / 1234</p>
                            <p>Demo Personel: ahmet / 1234 / SGK: 10909274686</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
