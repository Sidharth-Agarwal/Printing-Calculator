export class Invoice {
    constructor(data = {}) {
        this.id = data.id || '';
        this.invoiceNumber = data.invoiceNumber || '';
        this.orderId = data.orderId || '';
        this.orderNumber = data.orderNumber || '';
        this.clientId = data.clientId || '';
        this.status = data.status || '';
    
        // Client details
        this.clientName = data.clientName || '';
        this.clientAddress = data.clientAddress || '';
        this.clientGstin = data.clientGstin || '';
        this.contactPerson = data.contactPerson || '';
    
        // Invoice details
        this.issueDate = data.issueDate || new Date();
        this.dueDate = data.dueDate || new Date();
    
        // Order reference
        this.orderReference = data.orderReference || '';
        this.projectName = data.projectName || '';
    
        // Items
        this.items = data.items || [
            {
            description: '',
            jobType: '',
            quantity: 0,
            unitPrice: 0,
            hsnCode: '',
            gstRate: 0,
            taxableAmount: 0,
            gstAmount: 0,
            totalAmount: 0
            }
        ];
    
        // Totals
        this.subtotal = data.subtotal || 0;
        this.cgstAmount = data.cgstAmount || 0;
        this.sgstAmount = data.sgstAmount || 0;
        this.igstAmount = data.igstAmount || 0;
        this.gstTotal = data.gstTotal || 0;
        this.discountAmount = data.discountAmount || 0;
        this.discountPercentage = data.discountPercentage || 0;
        this.grandTotal = data.grandTotal || 0;
    
        // Payment details
        this.paymentTerms = data.paymentTerms || '';
        this.dueInDays = data.dueInDays || 0;
        this.paymentMethod = data.paymentMethod || '';
        this.paymentStatus = data.paymentStatus || '';
        this.payments = data.payments || [];
        this.amountPaid = data.amountPaid || 0;
        this.amountDue = data.amountDue || 0;
    
        // Notes and additional information
        this.notes = data.notes || '';
        this.termsAndConditions = data.termsAndConditions || '';
    
        // History
        this.history = data.history || [];
    
        // Metadata
        this.createdBy = data.createdBy || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedBy = data.updatedBy || '';
        this.updatedAt = data.updatedAt || new Date();
        this.paidAt = data.paidAt || new Date();
    }
}