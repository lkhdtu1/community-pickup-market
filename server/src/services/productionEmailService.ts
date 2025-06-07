// Production Email Templates with Enhanced Branding and Styling
import nodemailer from 'nodemailer';

interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  producerName: string;
  producerEmail?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  total: number;
  pickupPoint: string;
  pickupDate?: string;
}

interface OrderStatusUpdateData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  producerName: string;
  status: string;
  pickupPoint: string;
}

class ProductionEmailService {
  private transporter: nodemailer.Transporter;
  private brandColors = {
    primary: '#16a34a',
    secondary: '#22c55e',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    light: '#f8fafc',
    dark: '#1f2937'
  };

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private getEmailTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Community Pickup Market</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: ${this.brandColors.dark};
            background-color: #f8fafc;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, ${this.brandColors.primary} 0%, ${this.brandColors.secondary} 100%);
            padding: 30px;
            text-align: center;
            color: white;
          }
          
          .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          
          .tagline {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .card {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
            border-left: 4px solid ${this.brandColors.primary};
          }
          
          .card-success {
            background-color: #ecfdf5;
            border-left-color: ${this.brandColors.success};
          }
          
          .card-warning {
            background-color: #fffbeb;
            border-left-color: ${this.brandColors.warning};
          }
          
          .card-danger {
            background-color: #fef2f2;
            border-left-color: ${this.brandColors.danger};
          }
          
          .button {
            display: inline-block;
            background: linear-gradient(135deg, ${this.brandColors.primary} 0%, ${this.brandColors.secondary} 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 16px 0;
            transition: transform 0.2s;
          }
          
          .button:hover {
            transform: translateY(-2px);
          }
          
          .order-items {
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          
          .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          
          .item:last-child {
            border-bottom: none;
          }
          
          .total {
            font-size: 20px;
            font-weight: 700;
            color: ${this.brandColors.primary};
            text-align: right;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 2px solid ${this.brandColors.primary};
          }
          
          .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          
          .social-links {
            margin: 20px 0;
          }
          
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: ${this.brandColors.primary};
            text-decoration: none;
          }
          
          .highlight {
            background-color: ${this.brandColors.primary};
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 600;
          }
          
          @media (max-width: 600px) {
            .container {
              margin: 0;
              border-radius: 0;
            }
            
            .content, .header, .footer {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌱 Community Pickup Market</div>
            <div class="tagline">Votre marketplace local de confiance</div>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <div class="social-links">
              <a href="https://community-pickup-market.com">🌐 Site Web</a>
              <a href="mailto:support@community-pickup-market.com">📧 Support</a>
              <a href="tel:+33123456789">📞 Contact</a>
            </div>
            <p>© 2024 Community Pickup Market. Tous droits réservés.</p>
            <p style="margin-top: 12px;">
              <a href="https://community-pickup-market.com/unsubscribe" style="color: #6b7280;">Se désabonner</a> | 
              <a href="https://community-pickup-market.com/privacy" style="color: #6b7280;">Politique de confidentialité</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
    const itemsList = data.items
      .map(item => `
        <div class="item">
          <div>
            <strong>${item.name}</strong> × ${item.quantity}
          </div>
          <div>${(item.quantity * item.unitPrice).toFixed(2)}€</div>
        </div>
      `)
      .join('');

    const content = `
      <h1 style="color: ${this.brandColors.primary}; margin-bottom: 24px;">
        ✅ Commande confirmée !
      </h1>
      
      <p style="font-size: 18px; margin-bottom: 24px;">
        Bonjour <strong>${data.customerName}</strong>,
      </p>
      
      <p style="margin-bottom: 24px;">
        Votre commande <span class="highlight">#${data.orderId}</span> a été confirmée avec succès ! 
        Nous avons transmis votre demande au producteur qui va la préparer avec soin.
      </p>
      
      <div class="card card-success">
        <h3 style="color: ${this.brandColors.success}; margin-bottom: 16px;">📋 Détails de votre commande</h3>
        
        <p><strong>🏪 Producteur :</strong> ${data.producerName}</p>
        <p><strong>📍 Point de retrait :</strong> ${data.pickupPoint}</p>
        ${data.pickupDate ? `<p><strong>📅 Date de retrait :</strong> ${data.pickupDate}</p>` : ''}
        
        <div class="order-items">
          <h4 style="margin-bottom: 16px; color: ${this.brandColors.dark};">🛒 Produits commandés</h4>
          ${itemsList}
          <div class="total">
            Total : ${data.total.toFixed(2)}€
          </div>
        </div>
      </div>
      
      <div class="card">
        <h3 style="color: ${this.brandColors.primary}; margin-bottom: 16px;">🔔 Prochaines étapes</h3>
        <ul style="list-style: none; padding-left: 0;">
          <li style="margin-bottom: 8px;">✅ <strong>Maintenant :</strong> Votre commande est confirmée</li>
          <li style="margin-bottom: 8px;">🔄 <strong>Bientôt :</strong> Le producteur prépare votre commande</li>
          <li style="margin-bottom: 8px;">📧 <strong>Notification :</strong> Vous serez informé quand votre commande sera prête</li>
          <li style="margin-bottom: 8px;">🎉 <strong>Retrait :</strong> Récupérez vos produits frais au point de retrait</li>
        </ul>
      </div>
      
      <p style="text-align: center; margin: 32px 0;">
        <a href="https://community-pickup-market.com/orders/${data.orderId}" class="button">
          🔍 Suivre ma commande
        </a>
      </p>
      
      <p style="margin-top: 32px; color: #6b7280;">
        Des questions ? N'hésitez pas à nous contacter à 
        <a href="mailto:support@community-pickup-market.com" style="color: ${this.brandColors.primary};">support@community-pickup-market.com</a>
      </p>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'Community Pickup Market <orders@community-pickup-market.com>',
      to: data.customerEmail,
      subject: `✅ Commande confirmée #${data.orderId} - Community Pickup Market`,
      html: this.getEmailTemplate(content),
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOrderStatusUpdate(data: OrderStatusUpdateData): Promise<void> {
    const statusConfig = {
      'en_attente': { 
        label: 'En attente de préparation', 
        icon: '⏳', 
        color: this.brandColors.warning,
        cardClass: 'card-warning'
      },
      'preparee': { 
        label: 'En cours de préparation', 
        icon: '👨‍🍳', 
        color: this.brandColors.primary,
        cardClass: 'card'
      },
      'prete': { 
        label: 'Prête pour le retrait', 
        icon: '🎉', 
        color: this.brandColors.success,
        cardClass: 'card-success'
      },
      'retiree': { 
        label: 'Retirée', 
        icon: '✅', 
        color: this.brandColors.success,
        cardClass: 'card-success'
      },
      'annulee': { 
        label: 'Annulée', 
        icon: '❌', 
        color: this.brandColors.danger,
        cardClass: 'card-danger'
      }
    };

    const config = statusConfig[data.status as keyof typeof statusConfig] || statusConfig['en_attente'];
    const isReady = data.status === 'prete';
    const isCompleted = data.status === 'retiree';
    const isCancelled = data.status === 'annulee';

    const content = `
      <h1 style="color: ${config.color}; margin-bottom: 24px;">
        ${config.icon} Mise à jour de votre commande
      </h1>
      
      <p style="font-size: 18px; margin-bottom: 24px;">
        Bonjour <strong>${data.customerName}</strong>,
      </p>
      
      <p style="margin-bottom: 24px;">
        Le statut de votre commande <span class="highlight">#${data.orderId}</span> a été mis à jour.
      </p>
      
      <div class="card ${config.cardClass}">
        <h3 style="color: ${config.color}; margin-bottom: 16px; font-size: 24px;">
          ${config.icon} ${config.label}
        </h3>
        
        <p><strong>🏪 Producteur :</strong> ${data.producerName}</p>
        <p><strong>📍 Point de retrait :</strong> ${data.pickupPoint}</p>
        
        ${isReady ? `
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center;">
            <h4 style="color: ${this.brandColors.success}; margin-bottom: 12px; font-size: 20px;">
              🎊 Votre commande est prête !
            </h4>
            <p style="font-size: 16px; margin-bottom: 0;">
              Vous pouvez maintenant vous rendre au point de retrait pour récupérer vos produits frais.
            </p>
          </div>
        ` : ''}
        
        ${isCompleted ? `
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center;">
            <h4 style="color: ${this.brandColors.success}; margin-bottom: 12px; font-size: 20px;">
              🎉 Commande récupérée !
            </h4>
            <p style="font-size: 16px; margin-bottom: 0;">
              Merci d'avoir choisi Community Pickup Market. Nous espérons que vos produits vous plairont !
            </p>
          </div>
        ` : ''}
        
        ${isCancelled ? `
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center;">
            <h4 style="color: ${this.brandColors.danger}; margin-bottom: 12px; font-size: 20px;">
              Commande annulée
            </h4>
            <p style="font-size: 16px; margin-bottom: 0;">
              Votre commande a été annulée. Si vous avez des questions, n'hésitez pas à nous contacter.
            </p>
          </div>
        ` : ''}
      </div>
      
      ${!isCompleted && !isCancelled ? `
        <p style="text-align: center; margin: 32px 0;">
          <a href="https://community-pickup-market.com/orders/${data.orderId}" class="button">
            🔍 Suivre ma commande
          </a>
        </p>
      ` : ''}
      
      ${isCompleted ? `
        <p style="text-align: center; margin: 32px 0;">
          <a href="https://community-pickup-market.com/products" class="button">
            🛒 Commander à nouveau
          </a>
        </p>
      ` : ''}
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'Community Pickup Market <orders@community-pickup-market.com>',
      to: data.customerEmail,
      subject: `${config.icon} Commande #${data.orderId} - ${config.label}`,
      html: this.getEmailTemplate(content),
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendProducerOrderNotification(data: OrderConfirmationData & { producerEmail: string }): Promise<void> {
    const itemsList = data.items
      .map(item => `
        <div class="item">
          <div>
            <strong>${item.name}</strong> × ${item.quantity}
          </div>
          <div>${(item.quantity * item.unitPrice).toFixed(2)}€</div>
        </div>
      `)
      .join('');

    const content = `
      <h1 style="color: ${this.brandColors.primary}; margin-bottom: 24px;">
        🔔 Nouvelle commande reçue !
      </h1>
      
      <p style="font-size: 18px; margin-bottom: 24px;">
        Bonjour,
      </p>
      
      <p style="margin-bottom: 24px;">
        Excellente nouvelle ! Vous avez reçu une nouvelle commande 
        <span class="highlight">#${data.orderId}</span> sur Community Pickup Market.
      </p>
      
      <div class="card">
        <h3 style="color: ${this.brandColors.primary}; margin-bottom: 16px;">📋 Détails de la commande</h3>
        
        <p><strong>👤 Client :</strong> ${data.customerName}</p>
        <p><strong>📧 Email :</strong> 
          <a href="mailto:${data.customerEmail}" style="color: ${this.brandColors.primary};">${data.customerEmail}</a>
        </p>
        <p><strong>📍 Point de retrait :</strong> ${data.pickupPoint}</p>
        ${data.pickupDate ? `<p><strong>📅 Date de retrait souhaitée :</strong> ${data.pickupDate}</p>` : ''}
        
        <div class="order-items">
          <h4 style="margin-bottom: 16px; color: ${this.brandColors.dark};">🛒 Produits commandés</h4>
          ${itemsList}
          <div class="total">
            Total : ${data.total.toFixed(2)}€
          </div>
        </div>
      </div>
      
      <div class="card card-warning">
        <h3 style="color: ${this.brandColors.warning}; margin-bottom: 16px;">⚡ Actions requises</h3>
        <ul style="list-style: none; padding-left: 0;">
          <li style="margin-bottom: 8px;">📋 <strong>Préparer la commande</strong> selon les quantités demandées</li>
          <li style="margin-bottom: 8px;">🔄 <strong>Mettre à jour le statut</strong> pour informer le client</li>
          <li style="margin-bottom: 8px;">📧 <strong>Contacter le client</strong> si nécessaire</li>
          <li style="margin-bottom: 8px;">🎯 <strong>Organiser le retrait</strong> au point convenu</li>
        </ul>
      </div>
      
      <p style="text-align: center; margin: 32px 0;">
        <a href="https://community-pickup-market.com/producer/orders/${data.orderId}" class="button">
          🎛️ Gérer cette commande
        </a>
      </p>
      
      <div class="card">
        <h3 style="color: ${this.brandColors.primary}; margin-bottom: 16px;">💡 Conseils</h3>
        <ul style="list-style: none; padding-left: 0;">
          <li style="margin-bottom: 8px;">⚡ <strong>Réactivité :</strong> Confirmez rapidement la commande</li>
          <li style="margin-bottom: 8px;">📞 <strong>Communication :</strong> Tenez le client informé</li>
          <li style="margin-bottom: 8px;">🕒 <strong>Ponctualité :</strong> Respectez les horaires de retrait</li>
          <li style="margin-bottom: 8px;">✨ <strong>Qualité :</strong> Soignez la présentation de vos produits</li>
        </ul>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'Community Pickup Market <orders@community-pickup-market.com>',
      to: data.producerEmail,
      subject: `🔔 Nouvelle commande #${data.orderId} - Action requise`,
      html: this.getEmailTemplate(content),
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const productionEmailService = new ProductionEmailService();
export default ProductionEmailService;
