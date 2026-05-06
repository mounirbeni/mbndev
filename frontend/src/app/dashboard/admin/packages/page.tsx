'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { packageAPI } from '@/lib/api';
import { Package } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Check } from 'lucide-react';

const emptyForm = {
  name: '', slug: '', price: '', description: '', features: '',
  pages: '', revisions: '', deliveryDays: '', popular: false,
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPackages = () => {
    packageAPI.getAll()
      .then(({ data }) => setPackages(data.packages))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPackages(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (pkg: Package) => {
    setEditing(pkg);
    setForm({
      name: pkg.name, slug: pkg.slug, price: String(pkg.price),
      description: pkg.description || '', features: pkg.features?.join('\n') || '',
      pages: String(pkg.pages || ''), revisions: String(pkg.revisions || ''),
      deliveryDays: String(pkg.deliveryDays || ''), popular: pkg.popular || false,
    });
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        pages: Number(form.pages),
        revisions: Number(form.revisions),
        deliveryDays: Number(form.deliveryDays),
        features: form.features.split('\n').filter(Boolean),
      };

      if (editing) {
        await packageAPI.update(editing._id, payload);
        toast.success('Package updated');
      } else {
        await packageAPI.create(payload);
        toast.success('Package created');
      }
      setModal(false);
      fetchPackages();
    } catch {
      toast.error('Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this package?')) return;
    try {
      await packageAPI.delete(id);
      toast.success('Package deactivated');
      fetchPackages();
    } catch {
      toast.error('Failed to delete package');
    }
  };

  const set = (k: string) => (e: any) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pricing Packages</h1>
          <p className="text-slate-400 text-sm mt-1">{packages.length} active packages</p>
        </div>
        <Button size="md" onClick={openCreate}>
          <Plus className="w-4 h-4" /> New Package
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
            ))
          : packages.map((pkg, i) => (
              <motion.div
                key={pkg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass rounded-2xl p-6 border transition-all ${
                  pkg.popular ? 'border-primary-500/40' : 'border-white/5'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold">{pkg.name}</h3>
                    {pkg.popular && <Badge color="purple" className="mt-1">Popular</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(pkg)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(pkg._id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{formatCurrency(pkg.price)}</p>
                <p className="text-slate-500 text-xs mb-4">{pkg.description}</p>
                <ul className="space-y-1">
                  {pkg.features?.slice(0, 4).map((f) => (
                    <li key={f} className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-primary-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
      </div>

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Package' : 'New Package'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Package Name" value={form.name} onChange={set('name')} placeholder="Pro" />
          <Input label="Slug" value={form.slug} onChange={set('slug')} placeholder="pro" />
          <Input label="Price (USD)" type="number" value={form.price} onChange={set('price')} placeholder="699" />
          <Input label="Pages" type="number" value={form.pages} onChange={set('pages')} placeholder="10" />
          <Input label="Revisions" type="number" value={form.revisions} onChange={set('revisions')} placeholder="3" />
          <Input label="Delivery Days" type="number" value={form.deliveryDays} onChange={set('deliveryDays')} placeholder="14" />
          <div className="col-span-2">
            <Input label="Short Description" value={form.description} onChange={set('description')} placeholder="Best for growing businesses" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-slate-300 mb-1.5">Features (one per line)</label>
            <textarea
              value={form.features}
              onChange={set('features')}
              rows={5}
              className="w-full bg-dark-100 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 resize-none"
              placeholder="Up to 10 Pages&#10;Responsive Design&#10;CMS Integration"
            />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="popular" checked={form.popular as boolean} onChange={set('popular')} className="accent-primary-500" />
            <label htmlFor="popular" className="text-sm text-slate-300">Mark as Popular</label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>
            {editing ? 'Save Changes' : 'Create Package'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
