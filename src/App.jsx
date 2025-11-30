import { useEffect, useRef, memo, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Server, Network, Wifi, Code, Mail, Phone, MapPin, Github, Linkedin, ChevronDown, ExternalLink, Terminal, Cpu, Globe, Shield } from 'lucide-react'

function NetworkBackground({ divisor = 14, dotAlpha = 0.45, pointRadius = 2, linkAlpha = 0.25, thresholdDiv = 5, speed = 0.4, className = 'absolute inset-0 w-full h-full pointer-events-none opacity-60', interactive = false, mouseRadius = 200, mouseStrength = 0.12, friction = 0.96, maxSpeed, noise = 0.015, minSpeedFactor = 0.22, glowBlur = 6, glowColor = 'rgba(56, 189, 248, 0.25)', glowLines = false }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const pointsRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0, inside: false })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w = canvas.offsetWidth
    let h = canvas.offsetHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
    }

    const init = () => {
      resize()
      const count = Math.max(40, Math.floor(Math.sqrt(w * h) / divisor))
      pointsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
      }))
    }

    const step = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(dpr, dpr)
      const threshold = Math.min(w, h) / thresholdDiv
      const maxV = maxSpeed ?? speed * 1.2
      ctx.fillStyle = `rgba(14, 165, 233, ${dotAlpha})`
      
      for (let i = 0; i < pointsRef.current.length; i++) {
        const p = pointsRef.current[i]
        if (interactive && mouseRef.current.inside) {
          const dxm = p.x - mouseRef.current.x
          const dym = p.y - mouseRef.current.y
          const dm = Math.hypot(dxm, dym)
          if (dm > 0 && dm < mouseRadius) {
            const f = (1 - dm / mouseRadius) * mouseStrength
            p.vx += (dxm / dm) * f
            p.vy += (dym / dm) * f
          }
        }
        p.vx *= friction
        p.vy *= friction
        let vmag = Math.hypot(p.vx, p.vy)
        const baseV = speed
        const minV = baseV * minSpeedFactor
        if (vmag < minV) {
          if (vmag > 0) {
            const s = (minV + Math.random() * minV * 0.3) / vmag
            p.vx *= s
            p.vy *= s
          } else {
            const a = Math.random() * Math.PI * 2
            const vv = minV
            p.vx = Math.cos(a) * vv
            p.vy = Math.sin(a) * vv
          }
        }
        p.vx += (Math.random() - 0.5) * noise
        p.vy += (Math.random() - 0.5) * noise
        vmag = Math.hypot(p.vx, p.vy)
        if (vmag > maxV) {
          const s = maxV / vmag
          p.vx *= s
          p.vy *= s
        }
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        
        ctx.shadowBlur = glowBlur
        ctx.shadowColor = glowColor
        ctx.beginPath()
        ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        
        for (let j = i + 1; j < pointsRef.current.length; j++) {
          const q = pointsRef.current[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const dist = Math.hypot(dx, dy)
          let localThreshold = threshold
          let lineFactor = linkAlpha
          if (interactive && mouseRef.current.inside) {
            const dmP = Math.hypot(p.x - mouseRef.current.x, p.y - mouseRef.current.y)
            const dmQ = Math.hypot(q.x - mouseRef.current.x, q.y - mouseRef.current.y)
            const near = Math.max(0, 1 - Math.min(dmP, dmQ) / (mouseRadius * 1.2))
            localThreshold = threshold * (1 + 0.35 * near)
            lineFactor = linkAlpha + 0.4 * near
          }
          if (dist < localThreshold) {
            const alpha = 1 - dist / localThreshold
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            if (glowLines) {
              ctx.shadowBlur = glowBlur * 0.6
              ctx.shadowColor = glowColor
            }
            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha * lineFactor})`
            ctx.lineWidth = 1.2
            ctx.stroke()
            if (glowLines) {
              ctx.shadowBlur = 0
            }
          }
        }
      }
      ctx.restore()
    }

    const loop = () => {
      step()
      rafRef.current = requestAnimationFrame(loop)
    }

    init()
    loop()

    const handleResize = () => init()
    window.addEventListener('resize', handleResize)
    let onMouseMove
    let onMouseLeave
    if (interactive) {
      onMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect()
        mouseRef.current.x = e.clientX - rect.left
        mouseRef.current.y = e.clientY - rect.top
        mouseRef.current.inside = mouseRef.current.x >= 0 && mouseRef.current.x <= rect.width && mouseRef.current.y >= 0 && mouseRef.current.y <= rect.height
      }
      onMouseLeave = () => { mouseRef.current.inside = false }
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseleave', onMouseLeave)
    }
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', handleResize)
      if (interactive) {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseleave', onMouseLeave)
      }
    }
  }, [])

  return <canvas ref={canvasRef} className={className} />
}

const SectionHeader = memo(function SectionHeader({ icon: Icon, title, subtitle, align = 'left' }) {
  return (
    <div className={`mb-12 ${align === 'center' ? 'text-center' : ''}`}>
      <div className={`flex items-center gap-3 mb-3 ${align === 'center' ? 'justify-center' : ''}`}>
        <div className="p-2 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-main">{title}</h2>
      </div>
      {subtitle ? <p className={`text-text-muted max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}>{subtitle}</p> : null}
    </div>
  )
})

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
      <div className={`mx-auto max-w-5xl px-6 transition-all duration-300 ${
        isScrolled 
          ? 'bg-bg-surface/80 backdrop-blur-md border border-white/5 rounded-full py-2 shadow-xl' 
          : 'bg-transparent py-2'
      }`}>
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 text-text-main font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Network className="h-5 w-5" />
            </div>
            <span>Martino Cardoso</span>
          </a>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            <a href="#sobre" className="hover:text-primary transition-colors">Sobre</a>
            <a href="#habilidades" className="hover:text-primary transition-colors">Habilidades</a>
            <a href="#experiencia" className="hover:text-primary transition-colors">Experiência</a>
            <a href="#projetos" className="hover:text-primary transition-colors">Projetos</a>
          </nav>
          
          <a href="#contato" className="btn-primary text-xs py-2 px-4 rounded-full">Fale Comigo</a>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-28 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-bg-alt">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bg-surface via-bg-alt to-bg-alt opacity-40"></div>
        <div className="absolute inset-0 mask-hero-left opacity-70">
          <NetworkBackground interactive={true} mouseRadius={240} mouseStrength={0.14} friction={0.95} maxSpeed={0.7} noise={0.012} glowBlur={10} glowColor={'rgba(56, 189, 248, 0.3)'} divisor={12} dotAlpha={0.6} pointRadius={2.4} linkAlpha={0.4} thresholdDiv={4} speed={0.45} className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>
      </div>
      
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-bg-surface/50 border border-bg-highlight/30 px-3 py-1 text-xs font-medium text-primary mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Online
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text-main mb-6 leading-tight">
            Infraestrutura Inteligente <br />
            <span className="gradient-text">Automação & NOC</span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-muted mb-8 max-w-2xl leading-relaxed">
            Especialista em garantir que sua rede nunca pare. Transformo infraestrutura complexa em sistemas confiáveis através de monitoramento inteligente e automação.
          </p>
          
          <div className="flex flex-wrap gap-3 mb-10">
             <div className="chip"><Shield className="h-3.5 w-3.5" /> Segurança de Redes</div>
             <div className="chip"><Cpu className="h-3.5 w-3.5" /> Automação Python</div>
             <div className="chip"><Server className="h-3.5 w-3.5" /> Omada SDN</div>
             <div className="chip"><Terminal className="h-3.5 w-3.5" /> Linux & Bash</div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a href="#contato" className="btn-primary">
              <Mail className="h-4 w-4" />
              Entrar em Contato
            </a>
            <a href="#experiencia" className="btn-secondary">
              Ver Experiência
            </a>
            <div className="flex gap-2 ml-2">
              <a href="#" target="_blank" rel="noreferrer" className="p-2 text-text-muted hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://github.com/mart3ee" target="_blank" rel="noreferrer" className="p-2 text-text-muted hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted animate-bounce"
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  )
}

function About() {
  const age = new Date().getFullYear() - 2003
  
  return (
    <section id="sobre" className="section-padding bg-bg-main relative">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeader 
              icon={Server} 
              title="Sobre Mim" 
              subtitle="Não apenas mantenho redes funcionando — eu as otimizo para performance máxima."
            />
            <div className="space-y-4 text-text-muted text-lg leading-relaxed">
              <p>
                Com {age} anos e uma paixão por tecnologia, construí minha carreira resolvendo problemas complexos de conectividade. Minha especialidade não é apenas "fazer funcionar", mas criar ambientes resilientes.
              </p>
              <p>
                Atualmente lidero operações críticas de NOC, onde combino conhecimento profundo de hardware (TP-Link Omada, Cisco) com automação moderna (Python, AppScript). Isso me permite eliminar tarefas repetitivas e focar no que importa: estratégia e estabilidade.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-bg-surface border border-bg-highlight/30">
                <h3 className="text-3xl font-bold text-primary mb-1">3+</h3>
                <p className="text-sm text-text-muted">Anos de Experiência</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-20 blur-2xl"></div>
            <div className="relative rounded-2xl bg-bg-surface border border-bg-highlight/30 p-8 space-y-6">
               <h3 className="text-xl font-semibold text-text-main mb-4">Minha Stack Principal</h3>
               
               <div className="space-y-4">
                 <div>
                   <div className="flex justify-between mb-2">
                     <span className="text-sm font-medium text-text-muted">Redes & Infra (Omada/Cisco)</span>
                     <span className="text-sm font-bold text-primary">95%</span>
                   </div>
                   <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                     <div className="h-full bg-primary w-[95%] rounded-full"></div>
                   </div>
                 </div>
                 
                 <div>
                   <div className="flex justify-between mb-2">
                     <span className="text-sm font-medium text-text-muted">Automação (Python/Scripting)</span>
                     <span className="text-sm font-bold text-primary">85%</span>
                   </div>
                   <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                     <div className="h-full bg-primary w-[85%] rounded-full"></div>
                   </div>
                 </div>
                 
                 <div>
                   <div className="flex justify-between mb-2">
                     <span className="text-sm font-medium text-text-muted">Monitoramento (Zabbix/Grafana)</span>
                     <span className="text-sm font-bold text-primary">90%</span>
                   </div>
                   <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                     <div className="h-full bg-primary w-[90%] rounded-full"></div>
                   </div>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Skills() {
  const skills = [
    {
      icon: Network,
      title: "Infraestrutura de Redes",
      desc: "Gestão completa de NOC, protocolos TCP/IP, VLAN, VPN e segmentação de rede.",
      tags: ["Omada SDN", "Firewall", "Routing"]
    },
    {
      icon: Code,
      title: "Desenvolvimento & Automação",
      desc: "Scripts para automatizar processos manuais e integrar sistemas de monitoramento.",
      tags: ["Python", "AppScript", "API Integration"]
    },
    {
      icon: Server,
      title: "Servidores & Hardware",
      desc: "Instalação e manutenção de servidores físicos, switches gerenciáveis e APs.",
      tags: ["Windows Server", "Linux", "Virtualização"]
    },
    {
      icon: Shield,
      title: "Segurança da Informação",
      desc: "Implementação de políticas de segurança, controle de acesso e backups.",
      tags: ["Firewall Rules", "VPN SSL", "Access Control"]
    }
  ]

  return (
    <section id="habilidades" className="section-padding bg-bg-alt">
      <div className="container-custom">
        <SectionHeader 
          icon={Cpu} 
          title="Especialidades Técnicas" 
          subtitle="Um conjunto de ferramentas robusto para resolver desafios de qualquer escala."
          align="center"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="card hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <skill.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">{skill.title}</h3>
              <p className="text-sm text-text-muted mb-4 leading-relaxed">{skill.desc}</p>
              <div className="flex flex-wrap gap-2">
                {skill.tags.map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold text-primary/80 bg-primary/5 px-2 py-1 rounded border border-primary/10">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TimelineItem({ data, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-8 pb-12 border-l border-bg-highlight/30 last:border-0 last:pb-0"
    >
      <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-bg-main" />
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
        <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{data.period}</span>
        <h3 className="text-lg font-bold text-text-main">{data.company}</h3>
      </div>
      
      <h4 className="text-base font-medium text-text-muted mb-3">{data.role}</h4>
      
      <p className="text-text-muted/80 text-sm mb-4 leading-relaxed">
        {data.details}
      </p>
      
      {data.bullets && (
        <ul className="space-y-2">
          {data.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/50 flex-shrink-0" />
              {bullet}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

function Timeline() {
  const experiences = [
    {
      company: "GTS Net",
      period: "Atual",
      role: "Analista NOC / Suporte de Implantação",
      details: "Liderança técnica no projeto EACE (Escolas Conectadas). Gestão de equipe e automação de rotinas.",
      bullets: [
        'Configuração e hardening de firewalls TP-Link (regras e NAT)',
        'Segmentação de rede com VLANs e políticas de acesso',
        'Automação de rotinas de monitoramento com Python',
        'Gestão de incidentes com foco em disponibilidade 99.9%'
      ]
    },
    {
      company: "Foxinline Technologies",
      period: "2024",
      role: "Suporte de Atendimento",
      details: "Técnico de Suporte para o sistema Notário, garantindo continuidade operacional para cartórios.",
      bullets: [
        'Diagnóstico de conectividade e periféricos em rede',
        'Suporte a leitores biométricos e impressoras térmicas',
        'Resolução de chamados de alta prioridade'
      ]
    },
    {
      company: "2º Ofício de Notas",
      period: "2023-2024",
      role: "Suporte TI",
      details: "Manutenção preventiva e corretiva da infraestrutura de rede e hardware.",
      bullets: [
        'Administração de rede local e servidores de arquivos',
        'Suporte rápido a usuários finais',
        'Gestão de ativos de TI'
      ]
    },
    {
      company: "Infortech & Startech",
      period: "2023",
      role: "Técnico de TI",
      details: "Projeto de migração do sistema do Big Bompreço para o grupo Carrefour.",
      bullets: [
        'Migração massiva de PDVs e terminais',
        'Configuração de rede para novos padrões corporativos',
        'Troubleshooting em tempo real durante a virada de chave'
      ]
    }
  ]

  return (
    <section id="experiencia" className="section-padding bg-bg-main">
      <div className="container-custom max-w-4xl">
        <SectionHeader 
          icon={Terminal} 
          title="Trajetória Profissional" 
          subtitle="Evolução constante através de desafios reais e responsabilidades crescentes."
        />
        <div className="mt-12">
          {experiences.map((exp, i) => (
            <TimelineItem key={i} data={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contato" className="section-padding bg-bg-alt border-t border-bg-highlight/20">
      <div className="container-custom">
        <div className="rounded-3xl bg-bg-surface border border-bg-highlight/30 p-8 md:p-12 text-center overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-6">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-4">Vamos trabalhar juntos?</h2>
            <p className="text-text-muted max-w-xl mx-auto mb-8 text-lg">
              Estou sempre aberto a novos desafios e projetos interessantes. Se você precisa de uma infraestrutura sólida ou automação inteligente, entre em contato.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:martinocardoso.dev@gmail.com " className="btn-primary w-full sm:w-auto text-base px-8 py-3">
                <Mail className="h-5 w-5" />
                martinocardoso.dev@gmail.com 
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="btn-outline w-full sm:w-auto text-base px-8 py-3 bg-transparent">
                <Linkedin className="h-5 w-5" />
                LinkedIn
              </a>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-text-muted/60 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                (86) 99558-1863
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Teresina - PI
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="mt-16 text-center text-text-muted/40 text-sm">
          <p>© {new Date().getFullYear()} Martino Cardoso. Desenvolvido com React, Tailwind & Paixão.</p>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <div className="bg-bg-main text-text-main min-h-screen selection:bg-primary selection:text-white">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[60]"
        style={{ scaleX }}
      />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-35">
        <NetworkBackground interactive={true} friction={0.97} maxSpeed={0.6} noise={0.008} glowBlur={4} glowColor={'rgba(56, 189, 248, 0.2)'} divisor={16} dotAlpha={0.35} pointRadius={1.8} linkAlpha={0.22} thresholdDiv={5} speed={0.3} className="fixed inset-0 w-full h-full pointer-events-none" />
      </div>
      <Navbar />
      <main>
        <Hero />
        <div className="divider-alt-to-main" />
        <About />
        <div className="divider-main-to-alt" />
        <Skills />
        <div className="divider-alt-to-main" />
        <Timeline />
        <div className="divider-main-to-alt" />
        <Contact />
      </main>
    </div>
  )
}
