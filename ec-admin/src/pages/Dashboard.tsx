import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { productCategoryApi, productsApi } from '../services'

type MetricCardProps = {
  label: string
  value: number | string
  note: string
}

function MetricCard({ label, value, note }: MetricCardProps) {
  return (
    <Card className="min-h-[168px]">
      <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#b7c2df]">{label}</p>
      <p className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em] text-white">{value}</p>
      <p className="mt-3 max-w-xs text-sm text-[var(--muted)]">{note}</p>
    </Card>
  )
}

function Dashboard() {
  const [categoryCount, setCategoryCount] = useState<number | null>(null)
  const [productCount, setProductCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [categories, products] = await Promise.all([
          productCategoryApi.getCategories(),
          productsApi.getProducts({ page: 1, take: 1 }),
        ])

        setCategoryCount(categories.length)
        setProductCount(products.totalRecords)
      } finally {
        setLoading(false)
      }
    }

    void loadStats()
  }, [])

  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-[var(--line)] bg-[rgba(15,22,39,0.82)] px-6 py-7 shadow-[0_28px_72px_-44px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.32em] text-[#cfd8ff]">System Overview</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
              Command Center
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              A compact operations view for catalog growth, storefront readiness, and data hygiene.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-[var(--line)] bg-[rgba(255,255,255,0.03)] px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#b7c2df]">Sync State</p>
              <div className="mt-3 flex items-center gap-3">
                <Badge variant="success">Stable</Badge>
                <span className="text-sm text-[var(--muted)]">API responding normally</span>
              </div>
            </div>
            <div className="rounded-[22px] border border-[var(--line)] bg-[rgba(255,255,255,0.03)] px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#b7c2df]">Focus</p>
              <p className="mt-3 text-sm text-white">Prepare category structure for faster product onboarding</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <MetricCard
          label="Categories"
          value={loading ? '—' : categoryCount ?? 0}
          note="Live category total pulled from the backend."
        />
        <MetricCard
          label="Products"
          value={loading ? '—' : productCount ?? 0}
          note="Current product inventory count across the catalog."
        />
        <MetricCard
          label="Orders"
          value="0"
          note="Reserved panel for order pipeline once commerce events are wired in."
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card title="Operator Notes">
          <div className="space-y-4 text-sm text-[var(--muted)]">
            <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(255,255,255,0.025)] p-4">
              Use the category console to create a cleaner taxonomy before scaling product import volume.
            </div>
            <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(255,255,255,0.025)] p-4">
              The refreshed layout is designed to support denser tables, quicker scanning, and a more premium admin feel.
            </div>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link to="/categories" className="block">
              <Button variant="primary" className="w-full justify-between">
                Open Category Console
                <span className="font-mono text-xs uppercase tracking-[0.2em]">Enter</span>
              </Button>
            </Link>
            <Link to="/" className="block">
              <Button variant="secondary" className="w-full justify-between">
                Refresh Overview
                <span className="font-mono text-xs uppercase tracking-[0.2em]">Reload</span>
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  )
}

export default Dashboard
