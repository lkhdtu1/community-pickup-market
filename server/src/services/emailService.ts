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

class EmailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
    const itemsList = data.items
      .map(item => `- ${item.name} x${item.quantity} (${item.unitPrice.toFixed(2)}€)`)
      .join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Confirmation de commande</h2>
        
        <p>Bonjour ${data.customerName},</p>
        
        <p>Votre commande <strong>#${data.orderId}</strong> a été confirmée !</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Détails de la commande</h3>
          
          <p><strong>Producteur :</strong> ${data.producerName}</p>
          <p><strong>Point de retrait :</strong> ${data.pickupPoint}</p>
          ${data.pickupDate ? `<p><strong>Date de retrait :</strong> ${data.pickupDate}</p>` : ''}
          
          <h4 style="color: #374151;">Produits commandés :</h4>
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${itemsList}</pre>
          
          <p style="font-size: 18px; font-weight: bold; color: #16a34a;">
            Total : ${data.total.toFixed(2)}€
          </p>
        </div>
        
        <p>Nous vous informerons par email dès que votre commande sera prête pour le retrait.</p>
        
        <p>Merci de votre confiance !</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Community Pickup Market - Votre marketplace local
        </p>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@community-pickup-market.com',
      to: data.customerEmail,
      subject: `Confirmation de commande #${data.orderId}`,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOrderStatusUpdate(data: OrderStatusUpdateData): Promise<void> {
    const statusMessages = {
      'en_attente': 'En attente de préparation',
      'preparee': 'En cours de préparation',
      'prete': 'Prête pour le retrait',
      'retiree': 'Retirée',
      'annulee': 'Annulée'
    };

    const statusMessage = statusMessages[data.status as keyof typeof statusMessages] || data.status;
    const isReady = data.status === 'prete';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Mise à jour de votre commande</h2>
        
        <p>Bonjour ${data.customerName},</p>
        
        <p>Le statut de votre commande <strong>#${data.orderId}</strong> a été mis à jour :</p>
        
        <div style="background-color: ${isReady ? '#dcfce7' : '#f3f4f6'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isReady ? '#16a34a' : '#6b7280'};">
          <h3 style="margin-top: 0; color: ${isReady ? '#16a34a' : '#374151'};">
            ${statusMessage}
          </h3>
          
          ${isReady ? '<p><strong>🎉 Votre commande est prête pour le retrait !</strong></p>' : ''}
          
          <p><strong>Producteur :</strong> ${data.producerName}</p>
          <p><strong>Point de retrait :</strong> ${data.pickupPoint}</p>
        </div>
        
        ${isReady ? 
          '<p>Vous pouvez maintenant vous rendre au point de retrait pour récupérer votre commande.</p>' :
          '<p>Nous vous tiendrons informé de l\'évolution de votre commande.</p>'
        }
        
        <p>Merci de votre confiance !</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Community Pickup Market - Votre marketplace local
        </p>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@community-pickup-market.com',
      to: data.customerEmail,
      subject: `Commande #${data.orderId} - ${statusMessage}`,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }
  async sendProducerOrderNotification(data: OrderConfirmationData & { producerEmail: string }): Promise<void> {
    const itemsList = data.items
      .map(item => `- ${item.name} x${item.quantity} (${item.unitPrice.toFixed(2)}€)`)
      .join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Nouvelle commande reçue</h2>
        
        <p>Bonjour,</p>
        
        <p>Vous avez reçu une nouvelle commande <strong>#${data.orderId}</strong> !</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Détails de la commande</h3>
          
          <p><strong>Client :</strong> ${data.customerName}</p>
          <p><strong>Email :</strong> ${data.customerEmail}</p>
          <p><strong>Point de retrait :</strong> ${data.pickupPoint}</p>
          ${data.pickupDate ? `<p><strong>Date de retrait :</strong> ${data.pickupDate}</p>` : ''}
          
          <h4 style="color: #374151;">Produits commandés :</h4>
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${itemsList}</pre>
          
          <p style="font-size: 18px; font-weight: bold; color: #16a34a;">
            Total : ${data.total.toFixed(2)}€
          </p>
        </div>
        
        <p>Connectez-vous à votre tableau de bord pour gérer cette commande et mettre à jour son statut.</p>
        
        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>💡 Rappel :</strong> Pensez à mettre à jour le statut de la commande pour informer automatiquement le client !</p>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Community Pickup Market - Votre marketplace local
        </p>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@community-pickup-market.com',
      to: data.producerEmail,
      subject: `Nouvelle commande #${data.orderId}`,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
export default EmailService;
