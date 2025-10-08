import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditCard, Shield, TrendingUp, Zap } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: CreditCard,
      title: 'Cartão sem anuidade',
      description: 'Use o cartão de crédito sem pagar taxas'
    },
    {
      icon: Shield,
      title: 'Segurança total',
      description: 'Seus dados protegidos com criptografia'
    },
    {
      icon: TrendingUp,
      title: 'Controle financeiro',
      description: 'Acompanhe seus gastos em tempo real'
    },
    {
      icon: Zap,
      title: 'Transferências rápidas',
      description: 'Pix e transferências na velocidade da luz'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-primary min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6">
            Bem-vindo ao NuBank
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Seu banco digital completo, simples e sem complicações
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/login')}
            className="bg-white text-primary hover:bg-white/90 shadow-purple text-lg px-8 py-6 h-auto"
          >
            Acessar minha conta
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-slide-up">
            Tudo que você precisa em um só lugar
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-hover transition-smooth animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Acesse sua conta e descubra um novo jeito de lidar com seu dinheiro
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/login')}
            className="gradient-primary shadow-purple text-lg px-8 py-6 h-auto"
          >
            Fazer login agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-card border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>© 2025 NuBank Simulator. Projeto educacional.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
