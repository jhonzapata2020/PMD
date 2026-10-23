import React from 'react';
import { 
  UtensilsCrossed, 
  Home, 
  GraduationCap, 
  Activity, 
  Sprout, 
  Briefcase, 
  Tractor, 
  ShieldAlert, 
  Globe2, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  Phone,
  Mail,
  ShieldCheck,
  Award
} from 'lucide-react';

interface HeroAndProgramsProps {
  onSelectNewAssociate: () => void;
  onSelectExistingAssociate: () => void;
}

export const HeroAndPrograms: React.FC<HeroAndProgramsProps> = ({
  onSelectNewAssociate,
  onSelectExistingAssociate,
}) => {
  const programs = [
    {
      icon: UtensilsCrossed,
      title: 'Canasta de Alimentos Mensual',
      desc: 'Seguridad alimentaria integral y distribución mensual de paquetes nutricionales para familias vulnerables en territorio nacional.',
      color: 'from-amber-500 to-amber-600',
      tag: 'Nutrición',
    },
    {
      icon: Home,
      title: 'Vivienda Digna',
      desc: 'Programas de autoconstrucción, mejoramiento de hábitat y subsidios complementarios para acceso a techo digno.',
      color: 'from-blue-600 to-indigo-700',
      tag: 'Hábitat',
    },
    {
      icon: GraduationCap,
      title: 'Educación y Formación',
      desc: 'Becas educativas, capacitación técnica laboral y fortalecimiento escolar para niños, jóvenes y madres cabeza de hogar.',
      color: 'from-sky-500 to-blue-600',
      tag: 'Desarrollo',
    },
    {
      icon: Activity,
      title: 'Salud y Brigadas Médicas',
      desc: 'Atención primaria en salud, medicina preventiva, suministro de fármacos y brigadas especializadas en zonas rurales.',
      color: 'from-rose-500 to-red-600',
      tag: 'Bienestar',
    },
    {
      icon: Sprout,
      title: 'Proyectos Agroalimentarios e Agroindustriales',
      desc: 'Fomento a la siembra sostenible, tecnificación del campo, valor agregado a cosechas y comercialización directa y justa.',
      color: 'from-emerald-600 to-teal-700',
      tag: 'Campo',
    },
    {
      icon: Briefcase,
      title: 'Programa PYMES Productivas',
      desc: 'Capital semilla, microcréditos de cooperación y mentoría de negocios para consolidar pequeñas y medianas empresas productivas.',
      color: 'from-blue-800 to-slate-900',
      tag: 'Economía',
    },
    {
      icon: Tractor,
      title: 'Compra de Fincas para Campesinos',
      desc: 'Adquisición de tierras fértiles para entrega colectiva y asociativa a comunidades campesinas, garantizando arraigo y productividad.',
      color: 'from-amber-600 to-yellow-600',
      tag: 'Empoderamiento',
    },
    {
      icon: ShieldAlert,
      title: 'Atención a Catástrofes y Víctimas del Conflicto',
      desc: 'Respuesta humanitaria inmediata, socorro en desastres climáticos y programas de reparación integral a víctimas del conflicto armado.',
      color: 'from-red-600 to-rose-700',
      tag: 'Humanitario',
    },
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Sección Hero Principal */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white p-8 sm:p-14 shadow-2xl border border-blue-900/50">
        {/* Luces y círculos de acento corporativos */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Badge institucional */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-amber-300">
            <Globe2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Programa Cooperación Internacional Colombia</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span className="text-white">Dirigido por Grupo PMD SAS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Gestión Filantrópica de Recursos para la Transformación Social
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Operador de cooperación y desarrollo social en Colombia con <strong>NIT 901262947-1</strong>. Canalizamos recursos multilaterales para canasta alimentaria, vivienda digna, salud, educación, agroindustria y empoderamiento de campesinos y pymes.
          </p>

          {/* Sellos de Respaldo */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 font-medium">
            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Asociados a King Salman Humanitarian
            </span>
            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              Banca Multilateral
            </span>
            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Habeas Data • Ley 1581 de 2012
            </span>
          </div>

          {/* Botones de Llamado a la Acción para los 2 Formularios */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onSelectNewAssociate}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              <span>Registrarse como Nuevo Asociado</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onSelectExistingAssociate}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-slate-100 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Globe2 className="w-4 h-4 text-amber-400" />
              <span>Asociados Existentes (Cuenta Internacional)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Franja de Información de Contacto Oficial */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Razón Social y NIT</h4>
            <p className="font-extrabold text-blue-950 text-sm">GRUPO PMD SAS</p>
            <p className="text-xs text-slate-600 font-mono">NIT: 901262947-1</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Correo Electrónico</h4>
            <a href="mailto:empresasmussa2000@gmail.com" className="font-bold text-blue-900 text-sm hover:underline break-all">
              empresasmussa2000@gmail.com
            </a>
            <p className="text-xs text-slate-500">Atención oficial a solicitudes</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Línea de Contacto</h4>
            <a href="tel:3206748093" className="font-extrabold text-slate-900 text-sm hover:text-blue-700">
              320 674 8093
            </a>
            <p className="text-xs text-slate-500">Lunes a Sábado • Colombia</p>
          </div>
        </div>
      </section>

      {/* Sección: Los 8 Programas Sociales de Cooperación */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Ejes Misionales de Impacto Social
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-blue-950">
            Programas Sociales de Cooperación Internacional
          </h2>
          <p className="text-slate-600 text-sm">
            Recursos y líneas de acción coordinadas para el bienestar, desarrollo productivo y dignificación de las familias colombianas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm card-hover flex flex-col justify-between group cursor-default transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-900 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cobertura Nacional</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
