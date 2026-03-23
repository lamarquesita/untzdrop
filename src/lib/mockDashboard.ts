export interface Order {
  id: string;
  orderNumber: string;
  event: {
    id: number;
    name: string;
    date: string;
    venue: string;
    address: string;
    image_url: string | null;
  };
  ticketQuantity: number;
  ticketType: "ga" | "vip";
  pricePerTicket: number;
  amountPaid: number;
  datePurchased: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  isUpcoming: boolean;
  delivery: {
    method: string;
    email: string;
    phone: string;
  };
  payment: {
    cardLast4: string;
    cardBrand: string;
    cardholderName: string;
    subtotal: number;
    serviceFee: number;
    total: number;
    paidAt: string;
  };
  qrCode: string;
}

export interface Sale {
  id: string;
  orderNumber: string;
  event: {
    id: number;
    name: string;
    date: string;
    venue: string;
    address: string;
    image_url: string | null;
  };
  ticketQuantity: number;
  ticketType: "ga" | "vip";
  pricePerTicket: number;
  totalPayout: number;
  datePlaced: string;
  status: "completed" | "pending" | "transferred" | "cancelled";
  delivery: {
    buyerEmail: string;
    transferredAt: string | null;
  };
  earnings: {
    salePrice: number;
    platformFee: number;
    processingFee: number;
    netEarnings: number;
  };
  payout: {
    status: "paid" | "pending" | "processing";
    method: string | null;
    paidAt: string | null;
  };
}

export const mockSales: Sale[] = [
  {
    id: "sale_1",
    orderNumber: "CVS-20260305-001",
    event: {
      id: 1,
      name: "Tomorrowland Lima 2026",
      date: "2026-04-12T21:00:00",
      venue: "Estadio Nacional",
      address: "Av. José Díaz s/n, Lima",
      image_url: null,
    },
    ticketQuantity: 1,
    ticketType: "ga",
    pricePerTicket: 95,
    totalPayout: 82,
    datePlaced: "2026-03-05T18:30:00",
    status: "completed",
    delivery: {
      buyerEmail: "ana.garcia@email.com",
      transferredAt: "2026-03-05T18:35:00",
    },
    earnings: {
      salePrice: 95,
      platformFee: 9.5,
      processingFee: 3.5,
      netEarnings: 82,
    },
    payout: {
      status: "paid",
      method: "Transferencia Bancaria",
      paidAt: "2026-03-07T10:00:00",
    },
  },
  {
    id: "sale_2",
    orderNumber: "CVS-20260310-002",
    event: {
      id: 2,
      name: "Afterlife Lima",
      date: "2026-04-20T22:00:00",
      venue: "Costa 21",
      address: "Av. Costa Verde, San Miguel",
      image_url: null,
    },
    ticketQuantity: 2,
    ticketType: "vip",
    pricePerTicket: 280,
    totalPayout: 488,
    datePlaced: "2026-03-10T12:00:00",
    status: "transferred",
    delivery: {
      buyerEmail: "jorge.ruiz@email.com",
      transferredAt: "2026-03-10T12:10:00",
    },
    earnings: {
      salePrice: 560,
      platformFee: 56,
      processingFee: 16,
      netEarnings: 488,
    },
    payout: {
      status: "processing",
      method: "Transferencia Bancaria",
      paidAt: null,
    },
  },
  {
    id: "sale_3",
    orderNumber: "CVS-20260312-003",
    event: {
      id: 6,
      name: "EDC Peru 2026",
      date: "2026-06-01T17:00:00",
      venue: "Estadio San Marcos",
      address: "Av. Amézaga, Lima",
      image_url: null,
    },
    ticketQuantity: 1,
    ticketType: "ga",
    pricePerTicket: 130,
    totalPayout: 113,
    datePlaced: "2026-03-12T09:45:00",
    status: "pending",
    delivery: {
      buyerEmail: "maria.lopez@email.com",
      transferredAt: null,
    },
    earnings: {
      salePrice: 130,
      platformFee: 13,
      processingFee: 4,
      netEarnings: 113,
    },
    payout: {
      status: "pending",
      method: null,
      paidAt: null,
    },
  },
  {
    id: "sale_4",
    orderNumber: "CVS-20251215-004",
    event: {
      id: 5,
      name: "Resistance Lima",
      date: "2025-12-20T22:00:00",
      venue: "Arena Perú",
      address: "Av. de la Peruanidad, Jesús María",
      image_url: null,
    },
    ticketQuantity: 2,
    ticketType: "ga",
    pricePerTicket: 100,
    totalPayout: 174,
    datePlaced: "2025-12-15T14:20:00",
    status: "completed",
    delivery: {
      buyerEmail: "diego.torres@email.com",
      transferredAt: "2025-12-15T14:25:00",
    },
    earnings: {
      salePrice: 200,
      platformFee: 20,
      processingFee: 6,
      netEarnings: 174,
    },
    payout: {
      status: "paid",
      method: "Transferencia Bancaria",
      paidAt: "2025-12-18T09:00:00",
    },
  },
  {
    id: "sale_5",
    orderNumber: "CVS-20260301-005",
    event: {
      id: 3,
      name: "Ultra Music Festival Peru",
      date: "2026-05-10T18:00:00",
      venue: "Explanada Sur",
      address: "Costa Verde, Chorrillos",
      image_url: null,
    },
    ticketQuantity: 1,
    ticketType: "vip",
    pricePerTicket: 320,
    totalPayout: 278,
    datePlaced: "2026-03-01T20:00:00",
    status: "cancelled",
    delivery: {
      buyerEmail: "lucia.fernandez@email.com",
      transferredAt: null,
    },
    earnings: {
      salePrice: 320,
      platformFee: 32,
      processingFee: 10,
      netEarnings: 278,
    },
    payout: {
      status: "pending",
      method: null,
      paidAt: null,
    },
  },
  {
    id: "sale_6",
    orderNumber: "CVS-20260108-006",
    event: {
      id: 4,
      name: "Creamfields Lima 2026",
      date: "2026-01-15T20:00:00",
      venue: "Jockey Club",
      address: "Av. El Derby 055, Surco",
      image_url: null,
    },
    ticketQuantity: 3,
    ticketType: "ga",
    pricePerTicket: 90,
    totalPayout: 234,
    datePlaced: "2026-01-08T11:30:00",
    status: "completed",
    delivery: {
      buyerEmail: "pedro.silva@email.com",
      transferredAt: "2026-01-08T11:40:00",
    },
    earnings: {
      salePrice: 270,
      platformFee: 27,
      processingFee: 9,
      netEarnings: 234,
    },
    payout: {
      status: "paid",
      method: "Transferencia Bancaria",
      paidAt: "2026-01-10T10:00:00",
    },
  },
];

export const mockOrders: Order[] = [
  {
    id: "ord_1",
    orderNumber: "CV-20260412-001",
    event: {
      id: 1,
      name: "Tomorrowland Lima 2026",
      date: "2026-04-12T21:00:00",
      venue: "Estadio Nacional",
      address: "Av. José Díaz s/n, Lima",
      image_url: null,
    },
    ticketQuantity: 2,
    ticketType: "ga",
    pricePerTicket: 85,
    amountPaid: 187,
    datePurchased: "2026-03-01T14:30:00",
    status: "confirmed",
    isUpcoming: true,
    delivery: {
      method: "Transferencia Digital",
      email: "carlos@email.com",
      phone: "+51 987 654 321",
    },
    payment: {
      cardLast4: "4242",
      cardBrand: "Visa",
      cardholderName: "Carlos Mendoza",
      subtotal: 170,
      serviceFee: 17,
      total: 187,
      paidAt: "2026-03-01T14:30:00",
    },
    qrCode: "CVTICKET-20260412-001-GA-2",
  },
  {
    id: "ord_2",
    orderNumber: "CV-20260420-002",
    event: {
      id: 2,
      name: "Afterlife Lima",
      date: "2026-04-20T22:00:00",
      venue: "Costa 21",
      address: "Av. Costa Verde, San Miguel",
      image_url: null,
    },
    ticketQuantity: 1,
    ticketType: "vip",
    pricePerTicket: 250,
    amountPaid: 275,
    datePurchased: "2026-03-05T10:15:00",
    status: "confirmed",
    isUpcoming: true,
    delivery: {
      method: "Transferencia Digital",
      email: "carlos@email.com",
      phone: "+51 987 654 321",
    },
    payment: {
      cardLast4: "8910",
      cardBrand: "Mastercard",
      cardholderName: "Carlos Mendoza",
      subtotal: 250,
      serviceFee: 25,
      total: 275,
      paidAt: "2026-03-05T10:15:00",
    },
    qrCode: "CVTICKET-20260420-002-VIP-1",
  },
  {
    id: "ord_3",
    orderNumber: "CV-20260510-003",
    event: {
      id: 3,
      name: "Ultra Music Festival Peru",
      date: "2026-05-10T18:00:00",
      venue: "Explanada Sur",
      address: "Costa Verde, Chorrillos",
      image_url: null,
    },
    ticketQuantity: 3,
    ticketType: "ga",
    pricePerTicket: 120,
    amountPaid: 396,
    datePurchased: "2026-02-20T09:00:00",
    status: "pending",
    isUpcoming: true,
    delivery: {
      method: "Transferencia Digital",
      email: "carlos@email.com",
      phone: "+51 987 654 321",
    },
    payment: {
      cardLast4: "4242",
      cardBrand: "Visa",
      cardholderName: "Carlos Mendoza",
      subtotal: 360,
      serviceFee: 36,
      total: 396,
      paidAt: "2026-02-20T09:00:00",
    },
    qrCode: "CVTICKET-20260510-003-GA-3",
  },
  {
    id: "ord_4",
    orderNumber: "CV-20260115-004",
    event: {
      id: 4,
      name: "Creamfields Lima 2026",
      date: "2026-01-15T20:00:00",
      venue: "Jockey Club",
      address: "Av. El Derby 055, Surco",
      image_url: null,
    },
    ticketQuantity: 2,
    ticketType: "vip",
    pricePerTicket: 180,
    amountPaid: 396,
    datePurchased: "2025-12-10T16:45:00",
    status: "completed",
    isUpcoming: false,
    delivery: {
      method: "Transferencia Digital",
      email: "carlos@email.com",
      phone: "+51 987 654 321",
    },
    payment: {
      cardLast4: "8910",
      cardBrand: "Mastercard",
      cardholderName: "Carlos Mendoza",
      subtotal: 360,
      serviceFee: 36,
      total: 396,
      paidAt: "2025-12-10T16:45:00",
    },
    qrCode: "CVTICKET-20260115-004-VIP-2",
  },
  {
    id: "ord_5",
    orderNumber: "CV-20251220-005",
    event: {
      id: 5,
      name: "Resistance Lima",
      date: "2025-12-20T22:00:00",
      venue: "Arena Perú",
      address: "Av. de la Peruanidad, Jesús María",
      image_url: null,
    },
    ticketQuantity: 1,
    ticketType: "ga",
    pricePerTicket: 95,
    amountPaid: 105,
    datePurchased: "2025-11-28T11:20:00",
    status: "completed",
    isUpcoming: false,
    delivery: {
      method: "Transferencia Digital",
      email: "carlos@email.com",
      phone: "+51 987 654 321",
    },
    payment: {
      cardLast4: "4242",
      cardBrand: "Visa",
      cardholderName: "Carlos Mendoza",
      subtotal: 95,
      serviceFee: 10,
      total: 105,
      paidAt: "2025-11-28T11:20:00",
    },
    qrCode: "CVTICKET-20251220-005-GA-1",
  },
  {
    id: "ord_6",
    orderNumber: "CV-20260601-006",
    event: {
      id: 6,
      name: "EDC Peru 2026",
      date: "2026-06-01T17:00:00",
      venue: "Estadio San Marcos",
      address: "Av. Amézaga, Lima",
      image_url: null,
    },
    ticketQuantity: 4,
    ticketType: "ga",
    pricePerTicket: 110,
    amountPaid: 484,
    datePurchased: "2026-03-10T08:30:00",
    status: "confirmed",
    isUpcoming: true,
    delivery: {
      method: "Transferencia Digital",
      email: "carlos@email.com",
      phone: "+51 987 654 321",
    },
    payment: {
      cardLast4: "5678",
      cardBrand: "Visa",
      cardholderName: "Carlos Mendoza",
      subtotal: 440,
      serviceFee: 44,
      total: 484,
      paidAt: "2026-03-10T08:30:00",
    },
    qrCode: "CVTICKET-20260601-006-GA-4",
  },
  {
    id: "ord_7",
    orderNumber: "CV-20260315-007",
    event: {
      id: 7,
      name: "Piknic Électronik Lima",
      date: "2026-03-15T14:00:00",
      venue: "Parque de la Exposición",
      address: "Av. 28 de Julio, Lima",
      image_url: null,
    },
    ticketQuantity: 2,
    ticketType: "ga",
    pricePerTicket: 65,
    amountPaid: 143,
    datePurchased: "2026-02-28T19:00:00",
    status: "cancelled",
    isUpcoming: false,
    delivery: {
      method: "Transferencia Digital",
      email: "carlos@email.com",
      phone: "+51 987 654 321",
    },
    payment: {
      cardLast4: "4242",
      cardBrand: "Visa",
      cardholderName: "Carlos Mendoza",
      subtotal: 130,
      serviceFee: 13,
      total: 143,
      paidAt: "2026-02-28T19:00:00",
    },
    qrCode: "CVTICKET-20260315-007-GA-2",
  },
];
