import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Users, Trophy } from 'lucide-react';
import heroFootball1 from '@/assets/hero-football-1.jpg';
import heroFootball2 from '@/assets/hero-football-2.jpg';
import heroFootball3 from '@/assets/hero-football-3.jpg';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: heroFootball1,
      title: 'اكتشف مواهب كرة القدم الجديدة',
      subtitle: 'منصة شاملة لعرض وتسويق اللاعبين والمدربين من جميع الرياضات',
      cta: 'ابدأ الآن',
      stats: { players: '1000+', sports: '15+' }
    },
    {
      image: heroFootball2,
      title: 'طور مهاراتك الرياضية',
      subtitle: 'انضم لمجتمع الرياضيين وشارك موهبتك مع العالم',
      cta: 'سجل بياناتك',
      stats: { players: '1000+', sports: '15+' }
    },
    {
      image: heroFootball3,
      title: 'احتفل بانجازاتك الرياضية',
      subtitle: 'منصة تربط اللاعبين بالفرق والأندية المناسبة',
      cta: 'استكشف الفرص',
      stats: { players: '1000+', sports: '15+' }
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-[70vh] overflow-hidden rounded-3xl">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className="relative h-full">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-in slide-in-from-right duration-1000">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed animate-in slide-in-from-right duration-1000 delay-200">
                    {slide.subtitle}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-in slide-in-from-right duration-1000 delay-300">
                    <Button variant="default" size="xl" className="group">
                      <Play className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                      {slide.cta}
                    </Button>
                    <Button variant="outline" size="xl" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                      تعرف على المزيد
                    </Button>
                  </div>

                  <div className="flex items-center space-x-8 space-x-reverse animate-in slide-in-from-right duration-1000 delay-500">
                    <div className="flex items-center space-x-2 space-x-reverse text-white/90">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">{slide.stats.players} لاعب</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-white/90">
                      <Trophy className="w-5 h-5" />
                      <span className="font-semibold">{slide.stats.sports} رياضة</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-smooth backdrop-blur-sm"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-smooth backdrop-blur-sm"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 space-x-reverse">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;