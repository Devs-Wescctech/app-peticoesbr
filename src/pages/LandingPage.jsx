import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValue, animate, AnimatePresence } from "framer-motion";
import {
  FileSignature,
  Users,
  MessageCircle,
  Link2,
  BarChart3,
  Upload,
  FileText,
  Check,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Rocket,
  Target,
  Send,
  TrendingUp,
  Zap,
  Clock,
  Award,
  ArrowDown,
  X,
  Eye,
  ExternalLink,
  Hash,
  Calendar,
  Mail,
  Phone,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
}

function useCountUp(end, duration = 2, inView) {
  const count = useMotionValue(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const endStr = end.toString();
  const numericEnd = parseInt(endStr.replace(/[^0-9]/g, ""));
  
  const rounded = useTransform(count, (latest) => {
    const val = Math.round(latest);
    if (endStr.includes("K")) {
      return val + "K+";
    }
    if (endStr.includes("%")) {
      return val + "%";
    }
    return val + "+";
  });

  useEffect(() => {
    if (inView) {
      if (prefersReducedMotion) {
        count.set(numericEnd);
      } else {
        animate(count, numericEnd, { duration, ease: "easeOut" });
      }
    }
  }, [inView, numericEnd, duration, count, prefersReducedMotion]);

  return rounded;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 origin-left z-[100]"
      style={{ scaleX }}
    />
  );
}

function ParallaxLayer({ children, speed = 0.5, className = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 200]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

function RevealOnScroll({ children, direction = "up", delay = 0, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = usePrefersReducedMotion();

  const getVariants = () => {
    if (prefersReducedMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3, delay: delay * 0.5 } },
      };
    }
    
    return {
      hidden: {
        opacity: 0,
        y: direction === "up" ? 60 : direction === "down" ? -60 : 0,
        x: direction === "left" ? 60 : direction === "right" ? -60 : 0,
        scale: direction === "scale" ? 0.8 : 1,
      },
      visible: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        transition: {
          duration: 0.8,
          delay,
          ease: [0.25, 0.4, 0.25, 1],
        },
      },
    };
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={getVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FloatingElement({ children, duration = 3, distance = 15 }) {
  return (
    <motion.div
      animate={{
        y: [-distance, distance, -distance],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0 border-b transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(20px)",
          borderColor: scrolled ? "rgba(0,0,0,0.1)" : "transparent",
        }}
      />
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30"
            >
              <FileSignature className="w-5 h-5 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                PetiçõesBR
              </span>
              <span className="block text-xs text-gray-500 -mt-0.5">Mobilização Digital</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {["recursos", "como-funciona", "numeros"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item}`}
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors relative"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                {item === "recursos" ? "Recursos" : item === "como-funciona" ? "Como Funciona" : "Resultados"}
                <motion.span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </div>

          <Link to="/login">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 font-semibold px-6 transition-all duration-300">
                Acessar Plataforma
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/50" />
      
      <div className="absolute inset-0 overflow-hidden">
        <ParallaxLayer speed={-0.3}>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400/40 to-purple-400/40 rounded-full blur-3xl"
          />
        </ParallaxLayer>
        <ParallaxLayer speed={0.2}>
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
          />
        </ParallaxLayer>
        
        <ParallaxLayer speed={0.1}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 left-[10%] w-[300px] h-[300px] border border-indigo-200/30 rounded-full"
          />
        </ParallaxLayer>
        <ParallaxLayer speed={-0.1}>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="absolute top-40 right-[15%] w-[200px] h-[200px] border border-purple-200/40 rounded-full"
          />
        </ParallaxLayer>
        
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[8%] w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-indigo-200/30"
        />
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[25%] right-[12%] w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl backdrop-blur-sm border border-purple-200/30"
        />
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[30%] left-[15%] w-10 h-10 bg-gradient-to-br from-pink-500/20 to-indigo-500/20 rounded-lg backdrop-blur-sm border border-pink-200/30"
        />
        <motion.div
          animate={{ y: [0, 12, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-[25%] right-[10%] w-14 h-14 bg-gradient-to-br from-indigo-500/15 to-purple-500/15 rounded-2xl backdrop-blur-sm border border-indigo-200/20"
        />
        
        <FloatingElement duration={4} distance={20}>
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-indigo-400/60 rounded-full blur-sm" />
        </FloatingElement>
        <FloatingElement duration={5} distance={15}>
          <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-purple-400/50 rounded-full blur-sm" />
        </FloatingElement>
        <FloatingElement duration={3} distance={10}>
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-pink-400/60 rounded-full blur-sm" />
        </FloatingElement>
        <FloatingElement duration={6} distance={25}>
          <div className="absolute top-[20%] left-[60%] w-5 h-5 bg-indigo-300/50 rounded-full blur-sm" />
        </FloatingElement>
        <FloatingElement duration={4.5} distance={18}>
          <div className="absolute bottom-[40%] right-[30%] w-4 h-4 bg-purple-300/60 rounded-full blur-sm" />
        </FloatingElement>
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgb(99 102 241 / 0.06)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241 / 0.15) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <motion.div style={{ y, opacity, scale }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <RevealOnScroll direction="up" delay={0}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/50 backdrop-blur-sm mb-8">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Plataforma completa para mobilização digital
              </span>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-8">
              Transforme suas causas em
              <motion.span
                className="block mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              >
                movimentos de impacto
              </motion.span>
            </h1>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={0.2}>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 mb-12 leading-relaxed">
              Crie petições, colete assinaturas digitais, envie campanhas de WhatsApp 
              e construa páginas personalizadas para amplificar sua voz.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="scale" delay={0.3}>
            <Link to="/login">
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 font-bold text-lg px-10 py-7 rounded-2xl transition-all duration-300">
                  Começar Agora
                  <Rocket className="w-5 h-5 ml-3" />
                </Button>
              </motion.div>
            </Link>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-500">
              {["Plataforma completa", "Configuração em minutos", "Suporte humanizado"].map((text, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.9)" }}
                >
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{text}</span>
                </motion.div>
              ))}
            </div>
          </RevealOnScroll>

          <motion.div
            className="mt-16 flex justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <a href="#plataforma" className="text-gray-400 hover:text-indigo-600 transition-colors">
              <ArrowDown className="w-6 h-6" />
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function DashboardShowcase() {
  return (
    <section id="plataforma" className="py-20 md:py-28 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      <ParallaxLayer speed={-0.1} className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-full blur-3xl" />
      <ParallaxLayer speed={0.1} className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <RevealOnScroll direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 mb-6">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">Conheça a Plataforma</span>
            </div>
          </RevealOnScroll>
          
          <RevealOnScroll direction="up" delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Um painel completo
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                para gerenciar tudo
              </span>
            </h2>
          </RevealOnScroll>
          
          <RevealOnScroll direction="up" delay={0.2}>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Interface intuitiva e moderna para acompanhar petições, campanhas e métricas em tempo real.
            </p>
          </RevealOnScroll>
        </div>
        
        <RevealOnScroll direction="up" delay={0.3}>
          <DashboardPreview />
        </RevealOnScroll>
        
        <RevealOnScroll direction="up" delay={0.4} className="mt-12">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { icon: Zap, label: "Interface Rápida", desc: "Carregamento instantâneo" },
              { icon: BarChart3, label: "Métricas em Tempo Real", desc: "Dados sempre atualizados" },
              { icon: Target, label: "Foco em Resultados", desc: "Insights acionáveis" },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                className="flex flex-col items-center gap-2"
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="font-semibold text-gray-900">{item.label}</div>
                <div className="text-sm text-gray-500">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function DashboardPreview() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, scale, transformPerspective: 1200 }}
      className="relative"
    >
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20" />
      
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center gap-3 border-b border-gray-200">
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-red-400 cursor-pointer" />
            <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-yellow-400 cursor-pointer" />
            <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-green-400 cursor-pointer" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-gray-500 border border-gray-200 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              peticoesbr.com.br/dashboard
            </div>
          </div>
        </div>
        
        <div className="flex">
          <div className="hidden md:flex w-64 bg-gradient-to-b from-gray-50 to-white border-r border-gray-100 flex-col p-4">
            <div className="flex items-center gap-3 mb-8 p-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <FileSignature className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">PetiçõesBR</div>
                <div className="text-xs text-gray-500">Dashboard</div>
              </div>
            </div>
            
            <nav className="space-y-1">
              {[
                { icon: BarChart3, label: "Dashboard", active: true },
                { icon: FileText, label: "Minhas Petições", active: false },
                { icon: MessageCircle, label: "Campanhas WhatsApp", active: false },
                { icon: Link2, label: "Páginas LinkBio", active: false },
                { icon: Upload, label: "Importar Assinaturas", active: false },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + (i * 0.1) }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </motion.div>
              ))}
            </nav>
          </div>
          
          <div className="flex-1 p-6 bg-gradient-to-br from-gray-50/50 to-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Assinaturas Coletadas", value: "15.847", icon: Users, color: "from-indigo-500 to-blue-500", change: "+12%" },
                { label: "Petições Ativas", value: "8", icon: FileText, color: "from-purple-500 to-pink-500", change: "+3" },
                { label: "Mensagens Enviadas", value: "2.340", icon: MessageCircle, color: "from-emerald-500 to-teal-500", change: "+28%" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + (i * 0.1) }}
                  whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Petições em Destaque</h3>
                <span className="text-sm text-indigo-600 font-medium cursor-pointer hover:underline">Ver todas</span>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Mais áreas verdes na cidade", progress: 87, goal: "10.000", current: "8.700" },
                  { name: "Proteção aos animais de rua", progress: 65, goal: "5.000", current: "3.250" },
                  { name: "Melhoria no transporte público", progress: 42, goal: "15.000", current: "6.300" },
                ].map((petition, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 + (i * 0.1) }}
                    className="group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">{petition.name}</span>
                      <span className="text-sm text-gray-500">{petition.current}/{petition.goal}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${petition.progress}%` }}
                        transition={{ duration: 1.5, delay: 1.3 + (i * 0.2), ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const features = [
  {
    icon: FileSignature,
    title: "Petições Digitais",
    description: "Crie petições profissionais com páginas personalizadas, metas de assinaturas e formulários inteligentes.",
    color: "from-indigo-500 to-blue-500",
    modalContent: {
      fullDescription: "Crie petições digitais profissionais em minutos. Defina metas de assinaturas, personalize a aparência com seu logo e cores, e compartilhe em todas as redes. Acompanhe o progresso em tempo real e engaje seus apoiadores.",
      features: ["Páginas personalizáveis com seu logo", "Metas de assinaturas configuráveis", "Formulários inteligentes de coleta", "Compartilhamento em redes sociais", "URLs amigáveis e personalizadas"]
    }
  },
  {
    icon: MessageCircle,
    title: "Campanhas WhatsApp",
    description: "Envie mensagens em massa para sua base de apoiadores com links diretos para suas petições.",
    color: "from-green-500 to-emerald-500",
    modalContent: {
      fullDescription: "Alcance milhares de apoiadores instantaneamente via WhatsApp. Crie campanhas segmentadas, envie mensagens personalizadas com variáveis dinâmicas e acompanhe estatísticas de entrega em tempo real.",
      features: ["Envio em massa para contatos", "Variáveis dinâmicas (nome, cidade)", "Agendamento de campanhas", "Estatísticas de entrega", "Templates reutilizáveis"]
    }
  },
  {
    icon: Link2,
    title: "Páginas LinkBio",
    description: "Construa sua presença online com páginas personalizadas para centralizar suas causas.",
    color: "from-purple-500 to-pink-500",
    modalContent: {
      fullDescription: "Crie sua página LinkBio personalizada para centralizar todas as suas petições e redes sociais. Design moderno, múltiplos estilos de cards e integração com todas as plataformas.",
      features: ["Design responsivo e moderno", "Múltiplos estilos de cards", "Links para redes sociais", "Estatísticas de cliques", "URL personalizada"]
    }
  },
  {
    icon: Upload,
    title: "Importação de Assinaturas",
    description: "Importe assinaturas de planilhas para consolidar seus apoiadores em uma única plataforma.",
    color: "from-orange-500 to-red-500",
    modalContent: {
      fullDescription: "Consolide todas as suas assinaturas em um só lugar. Importe dados de planilhas Excel, Google Sheets ou CSV. Detecção automática de colunas e validação de dados duplicados.",
      features: ["Suporte a Excel, CSV e Google Sheets", "Mapeamento automático de colunas", "Validação de dados duplicados", "Histórico de importações", "Exportação para relatórios"]
    }
  },
  {
    icon: FileText,
    title: "Templates de Mensagens",
    description: "Crie e gerencie templates personalizados para suas campanhas de mobilização.",
    color: "from-cyan-500 to-blue-500",
    modalContent: {
      fullDescription: "Biblioteca de templates prontos para usar em suas campanhas. Crie mensagens personalizadas com variáveis dinâmicas, salve modelos reutilizáveis e mantenha a consistência da comunicação.",
      features: ["Biblioteca de templates prontos", "Editor visual de mensagens", "Variáveis dinâmicas", "Categorização por tipo", "Prévia em tempo real"]
    }
  },
  {
    icon: BarChart3,
    title: "Dashboard Completo",
    description: "Acompanhe métricas de petições, campanhas e engajamento em tempo real.",
    color: "from-violet-500 to-purple-500",
    modalContent: {
      fullDescription: "Visualize todas as métricas importantes em um só lugar. Dashboard intuitivo com gráficos interativos, relatórios exportáveis e insights para otimizar suas campanhas.",
      features: ["Métricas em tempo real", "Gráficos interativos", "Relatórios exportáveis", "Filtros por período", "Comparativo de campanhas"]
    }
  }
];

function FeatureModal({ feature, isOpen, onClose }) {
  if (!feature) return null;
  
  const mockScreens = {
    "Petições Digitais": (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FileSignature className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg">Mais áreas verdes na cidade</div>
              <div className="text-white/80 text-sm">peticoesbr.com.br/p/areas-verdes</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/20 rounded-full h-3">
              <div className="bg-white rounded-full h-3 w-3/4" />
            </div>
            <span className="font-bold">7.500 / 10.000</span>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">Queremos mais parques e praças em nossa cidade. Assine esta petição e faça parte desta mudança!</p>
          <div className="space-y-3">
            <input className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" placeholder="Seu nome completo" />
            <input className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" placeholder="Seu email" />
            <Button className="w-full bg-gradient-to-r from-indigo-500 to-blue-500">Assinar Petição</Button>
          </div>
        </div>
      </div>
    ),
    "Campanhas WhatsApp": (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
          <div className="font-bold">Nova Campanha WhatsApp</div>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nome da Campanha</label>
            <input className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50" value="Mobilização Áreas Verdes" readOnly />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Mensagem</label>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm">
              <p>Olá <span className="bg-green-100 text-green-700 px-1 rounded">{"{{nome}}"}</span>! 👋</p>
              <p className="mt-2">Precisamos da sua ajuda para conseguir mais áreas verdes em nossa cidade.</p>
              <p className="mt-2">Assine nossa petição: <span className="text-blue-600 underline">peticoesbr.com.br/p/areas-verdes</span></p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div>
              <div className="font-medium">Destinatários</div>
              <div className="text-sm text-gray-500">1.250 contatos selecionados</div>
            </div>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
            <Send className="w-4 h-4 mr-2" />
            Enviar Campanha
          </Button>
        </div>
      </div>
    ),
    "Páginas LinkBio": (
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-3xl">🌿</span>
          </div>
          <h3 className="font-bold text-xl">Movimento Verde SP</h3>
          <p className="text-white/80 text-sm">Lutando por um futuro sustentável</p>
        </div>
        <div className="space-y-3">
          {[
            { icon: FileSignature, label: "Assine nossa Petição" },
            { icon: Instagram, label: "@movimentoverdesp" },
            { icon: Globe, label: "Site Oficial" },
            { icon: Mail, label: "Contato" },
          ].map((item, i) => (
            <div key={i} className="bg-white/20 hover:bg-white/30 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-colors">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center text-white/60 text-xs">
          peticoesbr.com.br/bio/movimentoverdesp
        </div>
      </div>
    ),
    "Importação de Assinaturas": (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
          <div className="font-bold">Importar Assinaturas</div>
        </div>
        <div className="p-4">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center mb-4">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Arraste seu arquivo aqui</p>
            <p className="text-sm text-gray-400">Excel, CSV ou Google Sheets</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">assinaturas_evento.xlsx</span>
              <span className="text-green-600 font-medium">✓ 847 registros</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded px-2 py-1 text-xs border">Nome → nome_completo</div>
              <div className="flex-1 bg-white rounded px-2 py-1 text-xs border">Email → email</div>
            </div>
          </div>
          <Button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500">Importar Assinaturas</Button>
        </div>
      </div>
    ),
    "Templates de Mensagens": (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 text-white flex items-center justify-between">
          <div className="font-bold">Templates de Mensagens</div>
          <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
            + Novo Template
          </Button>
        </div>
        <div className="p-4 space-y-3">
          {[
            { name: "Convite para Petição", category: "Mobilização", color: "bg-indigo-100 text-indigo-700" },
            { name: "Agradecimento por Assinar", category: "Follow-up", color: "bg-green-100 text-green-700" },
            { name: "Lembrete de Meta", category: "Engajamento", color: "bg-orange-100 text-orange-700" },
          ].map((template, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 cursor-pointer transition-colors">
              <div>
                <div className="font-medium text-gray-900">{template.name}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${template.color}`}>{template.category}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    ),
    "Dashboard Completo": (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-4 text-white">
          <div className="font-bold">Dashboard</div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Assinaturas", value: "15.847", change: "+12%" },
              { label: "Campanhas", value: "24", change: "+3" },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{stat.label}</span>
                  <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Assinaturas por dia</div>
            <div className="flex items-end gap-1 h-16">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-violet-500 to-purple-400 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl">
        <div className={`relative bg-gradient-to-br ${feature.color} p-8 text-white overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <DialogHeader className="relative z-10">
            <div className="flex items-start gap-5">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/20"
              >
                <feature.icon className="w-8 h-8" />
              </motion.div>
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <DialogTitle className="text-2xl md:text-3xl font-bold text-white mb-2">{feature.title}</DialogTitle>
                  <p className="text-white/90 text-lg leading-relaxed">{feature.description}</p>
                </motion.div>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        <div className="p-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="grid lg:grid-cols-5 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">Sobre o recurso</h4>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.modalContent.fullDescription}</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">Funcionalidades</h4>
                </div>
                <ul className="space-y-3">
                  {feature.modalContent.features.map((item, i) => (
                    <motion.li 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-start gap-3 text-gray-600"
                    >
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <Link to="/login" className="block">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className={`w-full bg-gradient-to-r ${feature.color} text-white shadow-lg hover:shadow-xl transition-all py-6 text-lg font-semibold`}>
                    Começar a usar
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="sticky top-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">Preview do sistema</h4>
                </div>
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-inner">
                  <div className="transform hover:scale-[1.02] transition-transform duration-300">
                    {mockScreens[feature.title]}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeaturesSection() {
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  return (
    <section id="recursos" className="py-24 md:py-32 bg-white relative overflow-hidden">
      <ParallaxLayer speed={0.1} className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 to-transparent" />
      </ParallaxLayer>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-20">
          <RevealOnScroll direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">Recursos Poderosos</span>
            </div>
          </RevealOnScroll>
          
          <RevealOnScroll direction="up" delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Tudo para sua
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                mobilização digital
              </span>
            </h2>
          </RevealOnScroll>
          
          <RevealOnScroll direction="up" delay={0.2}>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Ferramentas profissionais para criar, gerenciar e amplificar movimentos sociais.
            </p>
          </RevealOnScroll>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <RevealOnScroll key={index} direction="up" delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -10, boxShadow: "0 25px 50px rgba(0,0,0,0.1)" }}
                className="group relative h-full cursor-pointer"
                onClick={() => setSelectedFeature(feature)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:border-indigo-100 transition-all duration-500 h-full flex flex-col">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed flex-1">{feature.description}</p>
                  <motion.button
                    className="mt-6 flex items-center gap-2 text-indigo-600 font-semibold group/btn"
                    whileHover={{ x: 5 }}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver exemplo</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </motion.button>
                </div>
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
      
      <FeatureModal 
        feature={selectedFeature} 
        isOpen={!!selectedFeature} 
        onClose={() => setSelectedFeature(null)} 
      />
    </section>
  );
}

const steps = [
  {
    number: "01",
    icon: FileSignature,
    title: "Crie sua Petição",
    description: "Configure sua petição em minutos com título, descrição e meta de assinaturas."
  },
  {
    number: "02",
    icon: Send,
    title: "Mobilize Apoiadores",
    description: "Use campanhas de WhatsApp e páginas LinkBio para alcançar sua audiência."
  },
  {
    number: "03",
    icon: Target,
    title: "Alcance seus Objetivos",
    description: "Acompanhe o progresso e transforme sua causa em movimento real."
  }
];

function HowItWorksSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const lineHeight = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"]);

  return (
    <section id="como-funciona" ref={ref} className="py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <ParallaxLayer speed={-0.1} className="absolute top-1/2 left-0 w-96 h-96 bg-gradient-to-r from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl -translate-y-1/2" />
      <ParallaxLayer speed={0.1} className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-20">
          <RevealOnScroll direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
              <Rocket className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">Simples e Rápido</span>
            </div>
          </RevealOnScroll>
          
          <RevealOnScroll direction="up" delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Como funciona
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                em 3 passos
              </span>
            </h2>
          </RevealOnScroll>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-20 bottom-20 w-0.5 bg-gray-200 -translate-x-1/2">
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-indigo-500 to-purple-500"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <RevealOnScroll
                key={index}
                direction={index % 2 === 0 ? "left" : "right"}
                delay={index * 0.2}
              >
                <div className={`md:flex items-center gap-8 ${index % 2 === 0 ? "" : "md:flex-row-reverse"} mb-12`}>
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all inline-block"
                    >
                      <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? "md:justify-end" : ""}`}>
                        <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                          {step.number}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                      <p className="text-gray-600 text-lg">{step.description}</p>
                    </motion.div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="hidden md:flex w-20 h-20 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-500 items-center justify-center shadow-xl z-10 mx-auto my-4 md:my-0"
                  >
                    <step.icon className="w-10 h-10 text-white" />
                  </motion.div>

                  <div className="flex-1" />
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>

        <RevealOnScroll direction="up" delay={0.6} className="text-center mt-16">
          <Link to="/login">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-xl shadow-purple-500/25 font-bold text-lg px-10 py-7 rounded-2xl">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </motion.div>
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}

const metrics = [
  { value: "50K", label: "Assinaturas Coletadas", icon: Users, description: "Por organizações na plataforma" },
  { value: "500", label: "Petições Criadas", icon: FileText, description: "Causas importantes mobilizadas" },
  { value: "10K", label: "Mensagens Enviadas", icon: MessageCircle, description: "Campanhas de WhatsApp" },
  { value: "98%", label: "Satisfação", icon: Award, description: "Dos usuários recomendam" },
];

function MetricCard({ metric, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useCountUp(metric.value, 2, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="relative group"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"
      />
      <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-100 shadow-sm group-hover:bg-transparent group-hover:border-transparent transition-all duration-500 text-center h-full">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 group-hover:bg-white/20 flex items-center justify-center mx-auto mb-4 transition-colors duration-500"
        >
          <metric.icon className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors duration-500" />
        </motion.div>
        <motion.div className="text-4xl md:text-5xl font-extrabold text-gray-900 group-hover:text-white mb-2 transition-colors duration-500">
          {count}
        </motion.div>
        <div className="text-lg font-semibold text-gray-700 group-hover:text-white/90 mb-1 transition-colors duration-500">
          {metric.label}
        </div>
        <div className="text-sm text-gray-500 group-hover:text-white/70 transition-colors duration-500">
          {metric.description}
        </div>
      </div>
    </motion.div>
  );
}

function MetricsSection() {
  return (
    <section id="numeros" className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-20">
          <RevealOnScroll direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">Resultados Comprovados</span>
            </div>
          </RevealOnScroll>
          
          <RevealOnScroll direction="up" delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Números que
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                inspiram confiança
              </span>
            </h2>
          </RevealOnScroll>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={ref} className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
      
      <motion.div style={{ y }} className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] border border-white/10 rounded-full" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] border border-white/10 rounded-full" />
      </motion.div>

      <FloatingElement duration={6} distance={20}>
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white/20 rounded-full" />
      </FloatingElement>
      <FloatingElement duration={4} distance={15}>
        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-white/15 rounded-full" />
      </FloatingElement>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <RevealOnScroll direction="up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8">
            <Clock className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">Comece em menos de 5 minutos</span>
          </div>
        </RevealOnScroll>
        
        <RevealOnScroll direction="up" delay={0.1}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Pronto para transformar
            <span className="block">sua mobilização digital?</span>
          </h2>
        </RevealOnScroll>
        
        <RevealOnScroll direction="up" delay={0.2}>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Junte-se a organizações e ativistas que já amplificam sua voz com o PetiçõesBR.
          </p>
        </RevealOnScroll>
        
        <RevealOnScroll direction="scale" delay={0.3}>
          <Link to="/login">
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 font-bold text-lg px-12 py-7 rounded-2xl shadow-2xl">
                Acessar Plataforma
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </motion.div>
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <FileSignature className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-2xl text-white">PetiçõesBR</span>
                <span className="block text-sm text-gray-500">Mobilização Digital</span>
              </div>
            </motion.div>
            <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
              A plataforma mais completa para criar petições, gerenciar campanhas e mobilizar apoiadores no Brasil.
            </p>
            <Link to="/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold">
                  Acessar Plataforma
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </Link>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6">Plataforma</h4>
            <ul className="space-y-4">
              {["recursos", "como-funciona", "numeros"].map((item) => (
                <li key={item}>
                  <motion.a
                    href={`#${item}`}
                    className="hover:text-white transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    {item === "recursos" ? "Recursos" : item === "como-funciona" ? "Como Funciona" : "Resultados"}
                  </motion.a>
                </li>
              ))}
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Acessar
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6">Suporte</h4>
            <ul className="space-y-4">
              <li>
                <motion.a 
                  href="https://wa.me/555130273382" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-2" 
                  whileHover={{ x: 5 }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Fale Conosco
                </motion.a>
              </li>
              <li>
                <motion.a 
                  href="https://wa.me/555130273382" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors" 
                  whileHover={{ x: 5 }}
                >
                  Central de Ajuda
                </motion.a>
              </li>
              <li>
                <motion.a 
                  href="https://wa.me/555130273382" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors" 
                  whileHover={{ x: 5 }}
                >
                  Contato
                </motion.a>
              </li>
            </ul>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm">
            &copy; {new Date().getFullYear()} PetiçõesBR. Todos os direitos reservados. | By{' '}
            <a 
              href="https://www.wescctech.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hover:from-indigo-300 hover:to-purple-300 transition-all"
            >
              Wescctech
            </a>
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <ScrollProgress />
      <Header />
      <HeroSection />
      <DashboardShowcase />
      <FeaturesSection />
      <HowItWorksSection />
      <MetricsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
