import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileSignature,
  Users,
  MessageCircle,
  Mail,
  Link2,
  BarChart3,
  Shield,
  Zap,
  Check,
  ArrowRight,
  Star,
  Sparkles,
  Globe,
  ChevronRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-gray-200/50" />
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FileSignature className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PetiçõesBR
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Recursos
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Planos
            </a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Depoimentos
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:flex font-medium">
                Entrar
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 font-medium">
                Acessar Sistema
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl" />
      </div>

      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241 / 0.15) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 mb-8">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Plataforma completa para mobilização digital</span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Transforme causas em
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              movimentos de impacto
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 mb-10">
            Crie petições online, colete assinaturas, gerencie campanhas de WhatsApp e Email, 
            e construa páginas personalizadas para amplificar sua voz.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/25 font-semibold text-lg px-8 py-6">
                Começar Agora Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 font-semibold text-lg px-8 py-6 group">
              <Play className="w-5 h-5 mr-2 group-hover:text-indigo-600 transition-colors" />
              Ver Demonstração
            </Button>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>Configuração em minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>Suporte humanizado</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-2xl opacity-20" />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 text-center">
                  <span className="text-sm text-gray-500">peticoesbr.com.br/dashboard</span>
                </div>
              </div>
              <div className="aspect-[16/9] bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-6 p-8 w-full max-w-4xl">
                  <div className="col-span-2 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Petições Ativas</h3>
                      <span className="text-indigo-600 font-bold">12</span>
                    </div>
                    <div className="space-y-3">
                      {[85, 62, 45].map((progress, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Petição {i + 1}</span>
                            <span className="text-gray-900 font-medium">{progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                      <Users className="w-8 h-8 text-indigo-600 mb-2" />
                      <div className="text-2xl font-bold text-gray-900">15.4K</div>
                      <div className="text-sm text-gray-500">Assinaturas</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                      <MessageCircle className="w-8 h-8 text-purple-600 mb-2" />
                      <div className="text-2xl font-bold text-gray-900">2.8K</div>
                      <div className="text-sm text-gray-500">Mensagens</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: FileSignature,
    title: "Petições Digitais",
    description: "Crie petições profissionais com páginas personalizadas, metas de assinaturas e formulários inteligentes.",
    color: "from-indigo-500 to-blue-500"
  },
  {
    icon: MessageCircle,
    title: "Campanhas WhatsApp",
    description: "Envie mensagens em massa para sua base de apoiadores com templates personalizados e rastreamento.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Mail,
    title: "Email Marketing",
    description: "Campanhas de email automatizadas com editor visual e métricas de engajamento em tempo real.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Link2,
    title: "Páginas LinkBio",
    description: "Construa sua presença online com páginas personalizadas estilo Linktree para suas causas.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: BarChart3,
    title: "Analytics Avançado",
    description: "Dashboard completo com métricas de conversão, origem de tráfego e desempenho de campanhas.",
    color: "from-cyan-500 to-blue-500"
  },
  {
    icon: Shield,
    title: "Multi-Tenancy",
    description: "Gerencie múltiplas organizações com isolamento completo de dados e controle de acesso.",
    color: "from-violet-500 to-purple-500"
  }
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Recursos Poderosos</span>
          </motion.div>
          
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tudo que você precisa para
            <span className="block text-indigo-600">mobilizar sua causa</span>
          </motion.h2>
          
          <motion.p variants={fadeInUp} className="max-w-2xl mx-auto text-lg text-gray-600">
            Uma plataforma completa para criar, gerenciar e amplificar movimentos sociais com ferramentas profissionais.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-6 flex items-center text-indigo-600 font-medium group-hover:translate-x-2 transition-transform">
                  Saiba mais <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Starter",
    price: "Grátis",
    description: "Ideal para começar sua mobilização",
    features: [
      "Até 3 petições ativas",
      "500 assinaturas/mês",
      "1 página LinkBio",
      "Campanhas básicas",
      "Suporte por email"
    ],
    popular: false,
    cta: "Começar Grátis"
  },
  {
    name: "Pro",
    price: "R$ 97",
    period: "/mês",
    description: "Para organizações em crescimento",
    features: [
      "Petições ilimitadas",
      "10.000 assinaturas/mês",
      "5 páginas LinkBio",
      "WhatsApp + Email",
      "Analytics avançado",
      "Suporte prioritário"
    ],
    popular: true,
    cta: "Assinar Pro"
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    description: "Soluções personalizadas",
    features: [
      "Tudo do Pro",
      "Assinaturas ilimitadas",
      "Multi-tenancy",
      "API dedicada",
      "SLA garantido",
      "Gerente de sucesso"
    ],
    popular: false,
    cta: "Falar com Vendas"
  }
];

function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
            <Globe className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Planos Flexíveis</span>
          </motion.div>
          
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Escolha o plano ideal
            <span className="block text-purple-600">para sua organização</span>
          </motion.h2>
          
          <motion.p variants={fadeInUp} className="max-w-2xl mx-auto text-lg text-gray-600">
            Comece grátis e escale conforme sua necessidade. Sem surpresas, sem taxas ocultas.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className={`relative rounded-2xl ${plan.popular ? 'ring-2 ring-indigo-500 scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white text-sm font-medium shadow-lg">
                  Mais Popular
                </div>
              )}
              <div className={`h-full bg-white rounded-2xl p-8 border ${plan.popular ? 'border-indigo-200' : 'border-gray-100'} shadow-lg`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-500">{plan.period}</span>}
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/login">
                  <Button 
                    className={`w-full font-semibold ${plan.popular 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    name: "Maria Silva",
    role: "Coordenadora ONG Verde Vida",
    content: "O PetiçõesBR transformou nossa capacidade de mobilização. Conseguimos 50 mil assinaturas em apenas 2 semanas!",
    rating: 5
  },
  {
    name: "João Santos",
    role: "Ativista Social",
    content: "A integração com WhatsApp é incrível. Nunca foi tão fácil engajar nossa comunidade e acompanhar os resultados.",
    rating: 5
  },
  {
    name: "Ana Oliveira",
    role: "Diretora Instituto Cidadão",
    content: "O melhor investimento que fizemos. A plataforma é intuitiva e o suporte é excepcional.",
    rating: 5
  }
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 mb-6">
            <Star className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Histórias de Sucesso</span>
          </motion.div>
          
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Organizações que confiam
            <span className="block text-green-600">no PetiçõesBR</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h60v60H0z%22 fill=%22none%22/%3E%3Cpath d=%22M30 30m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0%22 fill=%22rgba(255,255,255,0.1)%22/%3E%3C/svg%3E')]" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para transformar
            <span className="block">sua mobilização digital?</span>
          </motion.h2>
          
          <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de organizações que já amplificam sua voz com o PetiçõesBR.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-gray-100 font-semibold text-lg px-8 py-6 shadow-xl">
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-lg px-8 py-6">
              Agendar Demo
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <FileSignature className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">PetiçõesBR</span>
            </div>
            <p className="text-gray-400 max-w-md mb-6">
              A plataforma mais completa para criar petições, gerenciar campanhas e mobilizar apoiadores no Brasil.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Produto</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="hover:text-white transition-colors">Recursos</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Planos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Suporte</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} PetiçõesBR. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
