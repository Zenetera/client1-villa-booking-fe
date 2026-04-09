import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import {
  fetchVillaPricing,
  updateVillaPricing,
  fetchPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
} from '../../../api/admin';
import type { PricingRule, CreatePricingRuleInput } from '../../../api/admin';
import styles from './PricingPage.module.css';

const EMPTY_RULE: CreatePricingRuleInput = {
  name: '',
  startDate: '',
  endDate: '',
  pricePerNight: 0,
  minNights: null,
  priority: 0,
};

function formatDate(iso: string) {
  return iso.slice(0, 10);
}

export function PricingPage() {
  // Base pricing state
  const [basePricePerNight, setBasePricePerNight] = useState('');
  const [touristTaxPerNight, setTouristTaxPerNight] = useState('');
  const [minNights, setMinNights] = useState('');
  const [maxNights, setMaxNights] = useState('');
  const [baseSaving, setBaseSaving] = useState(false);
  const [baseError, setBaseError] = useState('');
  const [baseSuccess, setBaseSuccess] = useState('');

  // Pricing rules state
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [rulesError, setRulesError] = useState('');

  // Rule form state (add / edit)
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [ruleForm, setRuleForm] = useState<CreatePricingRuleInput>(EMPTY_RULE);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirm
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Load data
  const loadBase = useCallback(async () => {
    try {
      const v = await fetchVillaPricing();
      setBasePricePerNight(String(v.basePricePerNight));
      setTouristTaxPerNight(String(v.touristTaxPerNight));
      setMinNights(String(v.minNights));
      setMaxNights(v.maxNights != null ? String(v.maxNights) : '');
    } catch {
      setBaseError('Failed to load pricing data');
    }
  }, []);

  const loadRules = useCallback(async () => {
    try {
      setRulesLoading(true);
      const data = await fetchPricingRules();
      setRules(data);
    } catch {
      setRulesError('Failed to load pricing rules');
    } finally {
      setRulesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBase();
    loadRules();
  }, [loadBase, loadRules]);

  // Save base pricing
  async function handleSaveBase(e: React.FormEvent) {
    e.preventDefault();
    setBaseError('');
    setBaseSuccess('');
    setBaseSaving(true);

    const price = parseFloat(basePricePerNight);
    const tax = parseFloat(touristTaxPerNight);
    const min = parseInt(minNights);
    const max = maxNights ? parseInt(maxNights) : null;

    if (isNaN(price) || price <= 0) {
      setBaseError('Price per night must be a positive number');
      setBaseSaving(false);
      return;
    }
    if (isNaN(tax) || tax < 0) {
      setBaseError('Tourist tax must be zero or positive');
      setBaseSaving(false);
      return;
    }
    if (isNaN(min) || min < 1) {
      setBaseError('Minimum nights must be at least 1');
      setBaseSaving(false);
      return;
    }

    try {
      await updateVillaPricing({
        basePricePerNight: price,
        touristTaxPerNight: tax,
        minNights: min,
        maxNights: max,
      });
      setBaseSuccess('Pricing updated');
      setTimeout(() => setBaseSuccess(''), 3000);
    } catch (err) {
      setBaseError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setBaseSaving(false);
    }
  }

  // Rule form helpers
  function openAddForm() {
    setEditingId(null);
    setRuleForm(EMPTY_RULE);
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(rule: PricingRule) {
    setEditingId(rule.id);
    setRuleForm({
      name: rule.name,
      startDate: formatDate(rule.startDate),
      endDate: formatDate(rule.endDate),
      pricePerNight: parseFloat(rule.pricePerNight),
      minNights: rule.minNights,
      priority: rule.priority,
    });
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  }

  async function handleSaveRule(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!ruleForm.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!ruleForm.startDate || !ruleForm.endDate) {
      setFormError('Start and end dates are required');
      return;
    }
    if (new Date(ruleForm.endDate) < new Date(ruleForm.startDate)) {
      setFormError('End date must be on or after start date');
      return;
    }
    if (ruleForm.pricePerNight <= 0) {
      setFormError('Price per night must be positive');
      return;
    }

    setFormSaving(true);
    try {
      if (editingId) {
        await updatePricingRule(editingId, ruleForm);
      } else {
        await createPricingRule(ruleForm);
      }
      await loadRules();
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save rule');
    } finally {
      setFormSaving(false);
    }
  }

  async function handleDeleteRule(id: number) {
    try {
      await deletePricingRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setRulesError('Failed to delete rule');
    } finally {
      setDeletingId(null);
    }
  }

  // Render
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pricing</h1>
          <p className={styles.subtitle}>Manage base rates and seasonal pricing rules</p>
        </div>
      </div>

      {/* Base Pricing */}
      <form className={styles.form} onSubmit={handleSaveBase}>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Base Pricing</h2>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Price Per Night</label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.inputPrefix}>&euro;</span>
                <input
                  type="number"
                  className={styles.input}
                  value={basePricePerNight}
                  onChange={(e) => setBasePricePerNight(e.target.value)}
                  min={0}
                  step="0.01"
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Tourist Tax / Night</label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.inputPrefix}>&euro;</span>
                <input
                  type="number"
                  className={styles.input}
                  value={touristTaxPerNight}
                  onChange={(e) => setTouristTaxPerNight(e.target.value)}
                  min={0}
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Minimum Nights</label>
              <input
                type="number"
                className={styles.input}
                value={minNights}
                onChange={(e) => setMinNights(e.target.value)}
                min={1}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Maximum Nights</label>
              <input
                type="number"
                className={styles.input}
                value={maxNights}
                onChange={(e) => setMaxNights(e.target.value)}
                min={1}
                placeholder="No limit"
              />
            </div>
          </div>

          {baseError && <p className={styles.errorMsg}>{baseError}</p>}
          {baseSuccess && <p className={styles.successMsg}>{baseSuccess}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.saveButton} disabled={baseSaving}>
              {baseSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>

      {/* Pricing Rules */}
      <div className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Pricing Rules</h2>
            <p className={styles.sectionHint}>
              Seasonal or special rates that override the base price for specific date ranges.
              Higher priority rules take precedence when dates overlap.
            </p>
          </div>
          <button type="button" className={styles.addButton} onClick={openAddForm}>
            <Plus size={15} />
            Add Rule
          </button>
        </div>

        {rulesError && <p className={styles.errorMsg}>{rulesError}</p>}

        {rulesLoading ? (
          <p className={styles.emptyNote}>Loading...</p>
        ) : rules.length === 0 ? (
          <p className={styles.emptyNote}>
            No pricing rules yet. Add a rule to set seasonal or special rates.
          </p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Price / Night</th>
                  <th>Min Nights</th>
                  <th>Priority</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <td className={styles.ruleName}>{rule.name}</td>
                    <td>{formatDate(rule.startDate)}</td>
                    <td>{formatDate(rule.endDate)}</td>
                    <td>&euro;{parseFloat(rule.pricePerNight).toFixed(2)}</td>
                    <td>{rule.minNights ?? '—'}</td>
                    <td>{rule.priority}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => openEditForm(rule)}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        {deletingId === rule.id ? (
                          <div className={styles.confirmDelete}>
                            <button
                              type="button"
                              className={styles.confirmYes}
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              className={styles.confirmNo}
                              onClick={() => setDeletingId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={`${styles.iconButton} ${styles.iconDanger}`}
                            onClick={() => setDeletingId(rule.id)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile cards */}
        {!rulesLoading && rules.length > 0 && (
          <div className={styles.mobileRules}>
            {rules.map((rule) => (
              <div key={rule.id} className={styles.ruleCard}>
                <div className={styles.ruleCardHeader}>
                  <span className={styles.ruleCardName}>{rule.name}</span>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => openEditForm(rule)}
                    >
                      <Pencil size={14} />
                    </button>
                    {deletingId === rule.id ? (
                      <div className={styles.confirmDelete}>
                        <button
                          type="button"
                          className={styles.confirmYes}
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          className={styles.confirmNo}
                          onClick={() => setDeletingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={`${styles.iconButton} ${styles.iconDanger}`}
                        onClick={() => setDeletingId(rule.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles.ruleCardBody}>
                  <div className={styles.ruleCardDetail}>
                    <span className={styles.ruleCardLabel}>Dates</span>
                    <span>{formatDate(rule.startDate)} — {formatDate(rule.endDate)}</span>
                  </div>
                  <div className={styles.ruleCardDetail}>
                    <span className={styles.ruleCardLabel}>Price / Night</span>
                    <span>&euro;{parseFloat(rule.pricePerNight).toFixed(2)}</span>
                  </div>
                  <div className={styles.ruleCardDetail}>
                    <span className={styles.ruleCardLabel}>Min Nights</span>
                    <span>{rule.minNights ?? '—'}</span>
                  </div>
                  <div className={styles.ruleCardDetail}>
                    <span className={styles.ruleCardLabel}>Priority</span>
                    <span>{rule.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Rule Modal */}
      {showForm && (
        <div className={styles.backdrop} onClick={closeForm}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingId ? 'Edit Pricing Rule' : 'Add Pricing Rule'}
              </h3>
              <button type="button" className={styles.modalClose} onClick={closeForm}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveRule}>
              <div className={styles.modalBody}>
                <div className={styles.field}>
                  <label className={styles.label}>Rule Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={ruleForm.name}
                    onChange={(e) => setRuleForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Summer High Season"
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Start Date</label>
                    <input
                      type="date"
                      className={styles.input}
                      value={ruleForm.startDate}
                      onChange={(e) => setRuleForm((f) => ({ ...f, startDate: e.target.value }))}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>End Date</label>
                    <input
                      type="date"
                      className={styles.input}
                      value={ruleForm.endDate}
                      onChange={(e) => setRuleForm((f) => ({ ...f, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Price Per Night</label>
                    <div className={styles.inputWithPrefix}>
                      <span className={styles.inputPrefix}>&euro;</span>
                      <input
                        type="number"
                        className={styles.input}
                        value={ruleForm.pricePerNight || ''}
                        onChange={(e) =>
                          setRuleForm((f) => ({
                            ...f,
                            pricePerNight: parseFloat(e.target.value) || 0,
                          }))
                        }
                        min={0}
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Min Nights</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={ruleForm.minNights ?? ''}
                      onChange={(e) =>
                        setRuleForm((f) => ({
                          ...f,
                          minNights: e.target.value ? parseInt(e.target.value) : null,
                        }))
                      }
                      min={1}
                      placeholder="Any"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Priority</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={ruleForm.priority ?? 0}
                      onChange={(e) =>
                        setRuleForm((f) => ({ ...f, priority: parseInt(e.target.value) || 0 }))
                      }
                      min={0}
                    />
                  </div>
                </div>

                {formError && <p className={styles.errorMsg}>{formError}</p>}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelButton} onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton} disabled={formSaving}>
                  {formSaving ? 'Saving...' : editingId ? 'Update Rule' : 'Add Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
