import React, { useState, useEffect } from 'react';
import { Play, Square, TrendingUp, History, Shield, Activity, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Trade {
  id: number;
  timestamp: string;
  type: string;
  amount: string;
  result: string;
  status: string;
  balance: string;
}

interface Stats {
  totalTrades: number;
  wins: number;
  losses: number;
  currentBalance: number;
  targetBalance: number;
  currency: string;
}

export default function App() {
  const [isActive, setIsActive] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalTrades: 0,
    wins: 0,
    losses: 0,
    currentBalance: 0,
    targetBalance: 0,
    currency: "ETC"
  });
  const [history, setHistory] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setIsActive(data.active);
      setStats(data.stats);
      setHistory(data.history);
    } catch (err) {
      console.error("Failed to fetch status", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleBot = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bot/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !isActive }),
      });
      const data = await res.json();
      if (res.status >= 400) {
        setError(data.error);
        return;
      }
      setIsActive(data.active);
      setStats(data.stats);
      if (!data.active) setHistory([]);
    } catch (err) {
      console.error("Failed to toggle bot", err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const winRate = stats.totalTrades > 0 
    ? ((stats.wins / stats.totalTrades) * 100).toFixed(1) 
    : "0";

  const progress = stats.targetBalance > 0 
    ? Math.min(((stats.currentBalance / stats.targetBalance) * 100), 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0A0B0D]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Coinbase Alpha <span className="text-blue-500">Bot</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                {isActive ? 'Alavancagem 300% Ativa' : 'Sistema Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Error Alert */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-3"
            >
              <Shield className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Main Control Card */}
          <section className="bg-[#141519] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={80} />
            </div>
            
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Meta: Alavancar 300%</h2>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.currentBalance.toFixed(8)} {stats.currency}</p>
                  <p className="text-xs text-gray-500 mt-1">Saldo Real Disponível</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Wallet className="text-blue-500" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                  <span>Progresso da Meta</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-blue-600"
                  />
                </div>
                <p className="text-[10px] text-gray-500 text-right">Alvo: {stats.targetBalance.toFixed(8)} ETC</p>
              </div>

              <button
                onClick={toggleBot}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 ${
                  isActive 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                }`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isActive ? (
                  <><Square size={20} fill="currentColor" /> DESATIVAR BOT</>
                ) : (
                  <><Play size={20} fill="currentColor" /> INICIAR ALAVANCAGEM</>
                )}
              </button>

              <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Estratégia</p>
                  <p className="font-mono font-bold text-blue-400">AGRESSIVA</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Risco/Entrada</p>
                  <p className="font-mono font-bold">15%</p>
                </div>
              </div>
            </div>
          </section>

          {/* Performance Card */}
          <section className="bg-[#141519] border border-white/10 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Performance</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-green-500">{stats.wins}</p>
                <p className="text-xs text-gray-500 uppercase">Vitórias</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-red-500">{stats.losses}</p>
                <p className="text-xs text-gray-500 uppercase">Derrotas</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-blue-500">{winRate}%</p>
                <p className="text-xs text-gray-500 uppercase">Assertividade</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{stats.totalTrades}</p>
                <p className="text-xs text-gray-500 uppercase">Total Trades</p>
              </div>
            </div>
          </section>

          {/* Security Info */}
          <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
            <Shield className="text-blue-500 w-5 h-5 shrink-0" />
            <p className="text-xs text-blue-200/70 leading-relaxed">
              Gerenciamento de risco dinâmico ativado. Foco em preservação de capital com saídas parciais.
            </p>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-[#141519] border border-white/10 rounded-2xl flex flex-col h-full min-h-[500px]">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-400" />
                <h2 className="font-semibold">Histórico de Operações</h2>
              </div>
              <span className="text-xs text-gray-500">Últimas 10 entradas</span>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-white/5">
                    <th className="px-6 py-4 font-medium">Horário</th>
                    <th className="px-6 py-4 font-medium">Tipo</th>
                    <th className="px-6 py-4 font-medium">Valor</th>
                    <th className="px-6 py-4 font-medium">Resultado</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence initial={false}>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-600 italic">
                          Nenhuma operação realizada nesta sessão.
                        </td>
                      </tr>
                    ) : (
                      history.map((trade) => (
                        <motion.tr 
                          key={trade.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-gray-400">
                            {new Date(trade.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-[10px] font-bold">
                              {trade.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono">R$ {trade.amount}</td>
                          <td className={`px-6 py-4 font-mono font-bold ${parseFloat(trade.result) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {parseFloat(trade.result) >= 0 ? '+' : ''}R$ {trade.result}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                              trade.status === 'WIN' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                              {trade.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-8 border-t border-white/5 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 Coinbase Alpha Bot v2.0. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Suporte API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
