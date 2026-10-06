import ProductBuy from '@/components/products/ProductBuy';

const PLANS = {
  starter: { label: 'Starter', price: 37 },
  pro:     { label: 'Pro', price: 67 },
  agency:  { label: 'Agency', price: 97 },
};

export default function BuyProposalAiPage() {
  return <ProductBuy productId="proposal-ai" name="MBN Proposal AI" plans={PLANS} />;
}
