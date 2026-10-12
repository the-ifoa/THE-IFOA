import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  BarChart3,
  ArrowUpRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Flame
} from 'lucide-react';

/**
 * Modern, Clean & Professional Team Performance Analytics Card
 */
export default function TeamPerformanceCard({
  title = "Team Performance",
  subtitle = "Average across all finished exam attempts",
  metrics = {
    averageScore: 26.1,
    passRate: 0,
    attempts: 2,
    participants: 1
  },
  sections = [
    { name: "test", accuracy: 60.7, questions: 14, correct: 8 },
    { name: "gtrgtr", accuracy: 0, questions: 6, correct: 0 },
    { name: "test 2", accuracy: 0, questions: 8, correct: 0 },
    { name: "General", accuracy: 0, questions: 12, correct: 0 }
  ],
  onViewExams,
  className = ""
}) {
  // Strengths (>= 75%) and Needs Improvement (< 75%)
  const strengths = sections.filter((s) => s.accuracy >= 75);
  const needsImprovement = sections.filter((s) => s.accuracy < 75);

  const getScoreColor = (score) => {
    if (score >= 75) return {
      gradient: 'from-emerald-500 to-teal-400',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    };
    if (score >= 40) return {
      gradient: 'from-amber-500 to-yellow-400',
      badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
    };
    return {
      gradient: 'from-rose-500 to-pink-500',
      badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    };
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow duration-300 overflow-hidden ${className}`}>
      
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="p-6 pb-5 border-b border-slate-100/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {title}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewExams}
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50/60 hover:bg-indigo-100/70 border border-indigo-100 transition-all duration-200 cursor-pointer self-start sm:self-auto"
          >
            <span>View exams</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* ── KPI Stat Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6">
          
          {/* Average Score */}
          <div className="relative overflow-hidden bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-xl p-4 transition-all duration-200">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Average Score
              </span>
              <Award className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics.averageScore}%
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${metrics.averageScore >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {metrics.averageScore >= 50 ? 'Passing' : 'Below avg'}
              </span>
            </div>
          </div>

          {/* Pass Rate */}
          <div className="relative overflow-hidden bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-xl p-4 transition-all duration-200">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pass Rate
              </span>
              <Sparkles className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics.passRate}%
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Benchmark 70%
              </span>
            </div>
          </div>

          {/* Attempts */}
          <div className="relative overflow-hidden bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-xl p-4 transition-all duration-200">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Attempts
              </span>
              <Flame className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics.attempts}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Total completed
              </span>
            </div>
          </div>

          {/* Participants */}
          <div className="relative overflow-hidden bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-xl p-4 transition-all duration-200">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Participants
              </span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics.participants}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Active learners
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Main Content Grid ─────────────────────────────────── */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Accuracy by Section (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              Accuracy by Section
              <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                {sections.length}
              </span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Target ≥ 75%</span>
          </div>

          <div className="space-y-3">
            {sections.map((sec, idx) => {
              const colorInfo = getScoreColor(sec.accuracy);
              return (
                <div
                  key={sec.name || idx}
                  className="group p-3.5 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200/80 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800 capitalize group-hover:text-indigo-600 transition-colors">
                        {sec.name}
                      </span>
                      {sec.questions && (
                        <span className="text-[10px] text-slate-400">
                          ({sec.correct ?? 0}/{sec.questions} correct)
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-md border ${colorInfo.badge}`}>
                      {sec.accuracy}%
                    </span>
                  </div>

                  {/* Modern Animated Progress Track */}
                  <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${colorInfo.gradient}`}
                      style={{ width: `${Math.max(sec.accuracy, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Strengths & Improvement (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Strengths Card */}
          <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4 relative overflow-hidden">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs tracking-tight mb-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span>Strengths</span>
            </div>

            {strengths.length === 0 ? (
              <div className="flex items-start gap-2.5 text-emerald-700/80 text-xs bg-white/70 backdrop-blur-xs p-3 rounded-lg border border-emerald-100/60">
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">
                  No section at <span className="font-bold text-emerald-900">75%</span> or above yet. Keep practicing!
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {strengths.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white/80 p-2.5 rounded-lg border border-emerald-100 text-xs font-medium text-emerald-900"
                  >
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="capitalize">{item.name}</span>
                    </div>
                    <span className="font-bold text-emerald-700">{item.accuracy}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Needs Improvement Card */}
          <div className="rounded-xl border border-rose-200/70 bg-rose-50/40 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs tracking-tight">
                <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
                <span>Needs Improvement</span>
              </div>
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                Priority
              </span>
            </div>

            {needsImprovement.length === 0 ? (
              <p className="text-xs text-rose-700 font-medium bg-white/60 p-3 rounded-lg border border-rose-100">
                All sections are currently meeting target benchmarks.
              </p>
            ) : (
              <div className="space-y-1.5">
                {needsImprovement.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white/80 hover:bg-white p-2.5 rounded-lg border border-rose-100 text-xs text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="font-semibold text-slate-800 capitalize">{item.name}</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100/70 text-rose-700 border border-rose-200/50">
                      {item.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ── Optional Bottom Footer Status Strip ──────────────── */}
      <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          Analytics calculated across finished attempts
        </span>
        <span className="text-[11px] text-slate-400">
          Last updated just now
        </span>
      </div>

    </div>
  );
}
