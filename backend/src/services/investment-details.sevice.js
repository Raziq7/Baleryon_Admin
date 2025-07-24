import { prisma } from '../config/db.js';

export const investmentDetailsFind = async ({ userID }) => {
    // Find the investment by id, and include related investor and opportunity details
    const investments = await prisma.investment.findMany({
        where: { id: userID },
        include: {
            investor: true,
            opportunity: {
                include: {
                    investmentType: true,
                    businessCategory: true
                }
            },
            payouts: true
        }
    });

    if (!investments || investments.length === 0) {
        throw new Error('No Investment Exist');
    }

    // Map each investment to the desired structure
    return {
        investments: investments.map(investment => ({
            id: investment.id,
            amount: investment.amount,
            date: investment.date,
            roiPercent: investment.roiPercent,
            payoutMode: investment.payoutMode,
            contractStart: investment.contractStart,
            contractEnd: investment.contractEnd,
            paymentMethod: investment.paymentMethod,
            agreementSigned: investment.agreementSigned,
            status: investment.status,
            payouts: investment.payouts,
            opportunity: investment.opportunity
                ? {
                    id: investment.opportunity.id,
                    name: investment.opportunity.name,
                    brandName: investment.opportunity.brandName,
                    description: investment.opportunity.description,
                    minAmount: investment.opportunity.minAmount,
                    maxAmount: investment.opportunity.maxAmount,
                    roiPercent: investment.opportunity.roiPercent,
                    lockInMonths: investment.opportunity.lockInMonths,
                    exitOptions: investment.opportunity.exitOptions,
                    payoutMode: investment.opportunity.payoutMode,
                    isActive: investment.opportunity.isActive,
                    documents: investment.opportunity.documents,
                    investmentType: investment.opportunity.investmentType,
                    businessCategory: investment.opportunity.businessCategory
                }
                : null,
            investor: investment.investor
                ? {
                    id: investment.investor.id,
                    name: investment.investor.name,
                    email: investment.investor.email,
                    phone: investment.investor.phone,
                    type: investment.investor.type,
                    address: investment.investor.address,
                    pan: investment.investor.pan,
                    aadhaar: investment.investor.aadhaar,
                    gstNumber: investment.investor.gstNumber,
                    referredBy: investment.investor.referredBy,
                    status: investment.investor.status,
                    createdAt: investment.investor.createdAt,
                    updatedAt: investment.investor.updatedAt
                }
                : null
        }))
    };
};