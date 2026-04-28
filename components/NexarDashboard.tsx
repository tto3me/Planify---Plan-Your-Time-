import React from 'react';
import { ChevronDown, ChevronRight, Mic, Phone, Bell, Play, BarChart2, Sparkles, User, Edit2 } from 'lucide-react';
import TaskCard from './TaskCard';

export const NexarDashboard: React.FC = () => {
  return (
    <div className="relative p-4 sm:p-6 lg:p-8 overflow-x-hidden bg-blue-600 text-white rounded-3xl m-4 lg:m-8 shadow-xl">
      {/* Background (replaced video with blue color as requested) */}
      <div className="absolute inset-0 bg-blue-600 rounded-3xl -z-10" />

      <div className="max-w-[1800px] mx-auto">
        
        {/* HEADER */}
        <header 
          className="bg-white rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-sm flex items-center justify-between mb-8 animate-fade-up text-gray-900"
          style={{ animationDelay: '0s' }}
        >
          {/* Left */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-black rounded-md flex flex-wrap p-[3px] gap-[2px] items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-[2px]"></div>
              <div className="w-2 h-2 bg-white rounded-[2px]"></div>
              <div className="w-2 h-2 bg-white rounded-[2px]"></div>
              <div className="w-2 h-2 bg-white rounded-[2px]"></div>
            </div>
            <span className="font-serif-display text-2xl sm:text-3xl tracking-wide lowercase pt-1">planify</span>
          </div>

          {/* Center */}
          <nav className="hidden lg:flex items-center gap-8 font-medium text-sm">
            <a href="#" className="text-black">Workspace</a>
            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Actions</a>
            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Performance</a>
            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">AI Insights</a>
          </nav>

          {/* Right */}
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 rounded-full flex items-center p-1">
              <button className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-500 transition-colors">Solo</button>
              <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-black text-white transition-colors">Crew</button>
            </div>
            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shrink-0 hover:scale-105 transition-transform">
              <Bell size={18} fill="currentColor" />
            </button>
          </div>
        </header>

        {/* SECTION HEADER ROW */}
        <div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-7 border-b border-white/20 pb-4 sm:pb-6 mb-4 sm:mb-6 items-end animate-fade-up"
          style={{ animationDelay: '0.1s' }}
        >
          {/* Left */}
          <div className="lg:col-span-3 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg">
              <User size={28} className="text-white" />
            </div>
            <h1 className="font-serif-display text-[28px] sm:text-[36px] lg:text-[42px] leading-none pt-2">Hey, Alex!</h1>
          </div>

          {/* Center */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full lg:w-[85%] xl:w-[85%] 2xl:w-[60%] flex items-center">
              <h2 className="text-[20px] sm:text-[24px] lg:text-[26px] tracking-[-0.04em] font-medium text-white/90">Active Items</h2>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-3 flex items-center justify-end gap-3">
            <span className="font-medium text-white/80">Crew:</span>
            <div className="flex items-center -space-x-2">
              <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260403_075317_744395c6-7168-48c6-a1f6-5b9b7bd58f87.png&w=1280&q=85" alt="Crew" className="w-8 h-8 rounded-full border-2 border-blue-600 object-cover" />
              <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260403_075333_2caea84e-742e-4846-9284-ed8532c44c99.png&w=1280&q=85" alt="Crew" className="w-8 h-8 rounded-full border-2 border-blue-600 object-cover" />
              <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260403_075354_70a33cfd-3c9c-45ef-a7bb-d371cb8aa0af.png&w=1280&q=85" alt="Crew" className="w-8 h-8 rounded-full border-2 border-blue-600 object-cover" />
              <div className="w-8 h-8 rounded-full bg-white text-blue-600 border-2 border-blue-600 flex items-center justify-center text-xs font-bold z-10">+9</div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-7">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div 
              className="bg-[#DBECFC] text-gray-900 rounded-full p-2 pr-6 flex items-center justify-between shadow-sm animate-fade-up"
              style={{ animationDelay: '0.15s' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">Zenith Launch</span>
                  <span className="text-xs text-gray-500 font-medium">Product & Strategy</span>
                </div>
              </div>
              <ChevronDown className="text-gray-400" size={20} />
            </div>

            <div 
              className="flex flex-col animate-fade-up"
              style={{ animationDelay: '0.2s' }}
            >
              <h2 className="text-[80px] sm:text-[100px] lg:text-[120px] xl:text-[140px] tracking-[-0.04em] font-medium leading-[0.85] text-white">
                85<span className="text-[0.6em]">%</span>
              </h2>
              <span className="text-lg font-medium text-white/80 mt-2">Current efficiency</span>
            </div>

            <div 
              className="relative bg-white rounded-[20px] sm:rounded-[28px] p-6 shadow-sm overflow-hidden min-h-[220px] flex flex-col justify-between animate-fade-up text-gray-900 mt-4"
              style={{ animationDelay: '0.25s' }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-top opacity-20 pointer-events-none"
                style={{ backgroundImage: `url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260403_055416_630ff6c1-4b72-4cb6-a563-0c7e41124fe1.png&w=1280&q=85')` }}
              />
              <div className="relative z-10 flex items-center justify-between mb-8">
                <h3 className="font-bold text-xl">Sprint Metrics</h3>
                <span className="px-3 py-1 bg-gray-100 text-xs font-bold rounded-full uppercase tracking-wider">Analytics</span>
              </div>
              
              <div className="relative z-10 grid grid-cols-3 gap-2 pb-6">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">26h</span>
                  <span className="text-xs text-gray-500 font-medium">Sessions</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">11h</span>
                  <span className="text-xs text-gray-500 font-medium">Standups</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">6h</span>
                  <span className="text-xs text-gray-500 font-medium">Audits</span>
                </div>
              </div>

              <button className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-20 hover:scale-105 transition-transform border border-gray-100 text-gray-900">
                <Edit2 size={18} />
              </button>
            </div>
          </div>

          {/* CENTER COLUMN */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full lg:w-[85%] xl:w-[85%] 2xl:w-[60%] flex flex-col gap-5">
              
              <TaskCard 
                className="animate-fade-up text-gray-900"
                style={{ animationDelay: '0.3s' }}
                icon={Phone}
                title="Sprint Planning Call"
                tagText="Session"
                tagColor="green"
                details={[
                  { label: "Time", value: "Today: 10:00 AM" },
                  { label: "With", value: "Product & Growth" },
                  { label: "Alert", value: "15 min" }
                ]}
                bottomLeftContent={
                  <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-2">
                      <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260403_075317_744395c6-7168-48c6-a1f6-5b9b7bd58f87.png&w=1280&q=85" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                      <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260403_075333_2caea84e-742e-4846-9284-ed8532c44c99.png&w=1280&q=85" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                      <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260403_075354_70a33cfd-3c9c-45ef-a7bb-d371cb8aa0af.png&w=1280&q=85" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                      <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 border-2 border-white flex items-center justify-center text-[10px] font-bold z-10">+7</div>
                    </div>
                    <span className="text-sm font-medium text-gray-500 ml-1">Set to begin?</span>
                  </div>
                }
                buttonText="Enter session"
                buttonVariant="dark"
              />

              <TaskCard 
                className="animate-fade-up text-gray-900 rotate-[2deg] origin-center z-10"
                style={{ animationDelay: '0.35s' }}
                icon={BarChart2}
                title="Layout Critique"
                tagText="Action"
                tagColor="yellow"
                details={[
                  { label: "Focus", value: "Zenith Platform" },
                  { label: "Details", value: "Verify the layout of landing screen" },
                  { label: "Due By", value: "Mar 22" }
                ]}
                bottomLeftContent={
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Assignees:</span>
                    <div className="flex items-center -space-x-2">
                      <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260403_075317_744395c6-7168-48c6-a1f6-5b9b7bd58f87.png&w=1280&q=85" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                      <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260403_075333_2caea84e-742e-4846-9284-ed8532c44c99.png&w=1280&q=85" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                    </div>
                  </div>
                }
                buttonText="Let AI begin"
                buttonVariant="black"
                buttonIcon={<Sparkles size={16} />}
              />

              <TaskCard 
                className="animate-fade-up text-gray-900"
                style={{ animationDelay: '0.4s' }}
                icon={Phone}
                title="Zenith Crew Check"
                tagText="Session"
                tagColor="green"
                details={[
                  { label: "Time", value: "Fri: 5:30 PM" },
                  { label: "With", value: "Sales Lead & Team" },
                  { label: "Alert", value: "10 min" }
                ]}
                bottomLeftContent={
                  <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-2">
                      <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260403_075317_744395c6-7168-48c6-a1f6-5b9b7bd58f87.png&w=1280&q=85" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                      <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260403_075333_2caea84e-742e-4846-9284-ed8532c44c99.png&w=1280&q=85" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                      <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260403_075354_70a33cfd-3c9c-45ef-a7bb-d371cb8aa0af.png&w=1280&q=85" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                      <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 border-2 border-white flex items-center justify-center text-[10px] font-bold z-10">+5</div>
                    </div>
                    <span className="text-sm font-medium text-gray-500 ml-1">Scheduled</span>
                  </div>
                }
                buttonText="Show details"
                buttonVariant="light"
              />

            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            <div 
              className="flex flex-col gap-4 animate-fade-up text-white"
              style={{ animationDelay: '0.45s' }}
            >
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">
                    ⭐
                  </div>
                  <h3 className="text-[20px] sm:text-[24px] lg:text-[26px] xl:text-[30px] tracking-[-0.04em] font-medium leading-none">Fast commands</h3>
                </div>
                <button className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium border border-white/20">
                  + Add Item
                </button>
              </div>

              <div className="flex flex-col">
                <div className="flex items-start gap-4 py-4 border-t border-white/20 group cursor-pointer">
                  <div className="flex-1 text-sm font-medium leading-snug group-hover:text-blue-200 transition-colors">
                    Review session notes and extract key discussion insights
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                    <Play size={14} className="text-white group-hover:text-blue-600 fill-current" />
                  </div>
                </div>

                <div className="flex items-start gap-4 py-4 border-t border-white/20 group cursor-pointer">
                  <div className="flex-1 text-sm font-medium leading-snug group-hover:text-blue-200 transition-colors">
                    Generate PDF report with finished items from this week
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                    <Play size={14} className="text-white group-hover:text-blue-600 fill-current" />
                  </div>
                </div>

                <div className="flex items-start gap-4 py-4 border-t border-white/20 group cursor-pointer">
                  <div className="flex-1 text-sm font-medium leading-snug group-hover:text-blue-200 transition-colors">
                    Update timeline view based on revised action items in sprint
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                    <Play size={14} className="text-white group-hover:text-blue-600 fill-current" />
                  </div>
                </div>
              </div>
            </div>

            <div 
              className="relative bg-[#DBECFC] rounded-[20px] sm:rounded-[28px] p-6 shadow-sm flex flex-col items-center text-center mt-4 animate-fade-up text-gray-900 pb-12"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="px-4 py-1.5 rounded-full bg-blue-500 text-white text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                Audio Input
              </div>
              
              <h3 className="font-serif-display text-4xl sm:text-5xl mb-8 leading-none">Speak now to Planify!</h3>
              
              <div className="flex items-end justify-center gap-1 h-12 w-full max-w-[280px] mb-4">
                {[8, 16, 12, 28, 20, 36, 42, 24, 40, 16, 44, 32, 48, 28, 20, 36, 14, 32, 22, 40, 18, 30, 12, 26, 16, 34, 20, 38, 24, 28, 16, 22, 12, 20, 8].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-[3px] sm:w-1 bg-blue-400 rounded-full"
                    style={{ height: `${h * 0.8}px` }}
                  />
                ))}
              </div>

              <button className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center z-20 hover:scale-105 transition-transform border border-gray-100 text-blue-600">
                <Mic size={24} fill="currentColor" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default NexarDashboard;
