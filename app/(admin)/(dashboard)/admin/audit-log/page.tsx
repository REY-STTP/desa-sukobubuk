import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Tag as UTag } from '@/components/ui/tag'
import Pagination from '@/components/admin/Pagination'
import SearchInput from '@/components/admin/SearchInput'
import { EmptyState } from '@/components/ui/empty-state'
import {
  AdminTable,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableHeaderCell,
  AdminTableCell,
} from '@/components/admin/Table'
import { ShieldCheck, Clock, User, FileText } from 'lucide-react'

export const metadata: Metadata = { title: 'Audit Log' }

interface Props {
  searchParams: Promise<{ page?: string; q?: string; entity?: string; action?: string }>
}

export default async function AdminAuditLogPage({ searchParams }: Props) {
  const { page: pageParam, q, entity, action } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const search = q?.trim() ?? ''
  const entityFilter = entity?.trim() || undefined
  const actionFilter = action?.trim() || undefined

  const take = 20
  const skip = (page - 1) * take

  const where: Record<string, unknown> = {}
  if (entityFilter) (where as Record<string, string>).entity = entityFilter
  if (actionFilter) (where as Record<string, string>).action = actionFilter
  if (search) {
    ;(where as Record<string, unknown>).OR = [
      { entityId: { contains: search, mode: 'insensitive' } },
      { userEmail: { contains: search, mode: 'insensitive' } },
      { action: { contains: search, mode: 'insensitive' } },
      { entity: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.auditLog.count({ where: where as never }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / take))

  // Build basePath preserving filters
  const qp = new URLSearchParams()
  if (search) qp.set('q', search)
  if (entityFilter) qp.set('entity', entityFilter)
  if (actionFilter) qp.set('action', actionFilter)
  const basePath = `/admin/audit-log${qp.toString() ? `?${qp.toString()}&` : '?'}`.replace(/\?$/, '').replace(/&$/, '')

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-stone-800 flex items-center gap-2">
            <ShieldCheck className="size-6 text-sage-600" />
            Audit Log
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {search || entityFilter || actionFilter
              ? `${total} hasil filter`
              : `${total} aktivitas tercatat`}
            <span className="text-stone-400"> — retensi 90 hari</span>
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput placeholder="Cari entity, aksi, email, atau ID..." defaultValue={search} />
        </div>
        <div className="flex gap-2">
          <form className="flex gap-2">
            <input type="hidden" name="q" value={search} />
            <select
              name="entity"
              defaultValue={entityFilter ?? ''}
              className="h-9 rounded-xl border border-stone-200 bg-white px-3 text-sm"
            >
              <option value="">Semua entity</option>
              <option value="berita">berita</option>
              <option value="umkm">umkm</option>
              <option value="produk">produk</option>
              <option value="galeri">galeri</option>
              <option value="pesan">pesan</option>
              <option value="profil">profil</option>
              <option value="pejabat">pejabat</option>
              <option value="pengaturan">pengaturan</option>
              <option value="upload">upload</option>
            </select>
            <select
              name="action"
              defaultValue={actionFilter ?? ''}
              className="h-9 rounded-xl border border-stone-200 bg-white px-3 text-sm"
            >
              <option value="">Semua aksi</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="UPLOAD">UPLOAD</option>
            </select>
            <button
              type="submit"
              className="h-9 rounded-xl bg-sage-700 px-4 text-sm font-medium text-white hover:bg-sage-800"
            >
              Filter
            </button>
          </form>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="surface-elevated">
          <EmptyState
            icon={<ShieldCheck className="size-6" />}
            title={search || entityFilter || actionFilter ? `Tidak ada log yang cocok` : 'Belum ada aktivitas'}
            description={
              search || entityFilter || actionFilter
                ? 'Coba ubah filter atau kata kunci.'
                : 'Aktivitas admin (buat/ubah/hapus) akan tercatat di sini.'
            }
          />
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {rows.map((row) => (
              <div key={row.id} className="surface-elevated p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UTag tone={row.action === 'DELETE' ? 'ember' : row.action === 'CREATE' ? 'sage' : 'stone'} size="sm">
                      {row.action}
                    </UTag>
                    <span className="text-xs font-mono text-stone-500">{row.entity}</span>
                  </div>
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDate(row.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-stone-800 break-all">
                  {row.entityId ? `${row.entity} #${row.entityId}` : row.entity}
                </p>
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                  <User className="size-3" />
                  {row.userEmail ?? `user #${row.userId ?? '-'}`} {row.ip ? `· ${row.ip}` : ''}
                </p>
                {row.payload ? (
                  <pre className="mt-2 max-h-20 overflow-auto rounded-lg bg-stone-50 p-2 text-xs font-mono text-stone-600">
                    {JSON.stringify(row.payload, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <AdminTable>
              <AdminTableHead>
                <tr>
                  <AdminTableHeaderCell>Waktu</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Aksi</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Entity</AdminTableHeaderCell>
                  <AdminTableHeaderCell>User</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Payload</AdminTableHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {rows.map((row) => (
                  <AdminTableRow key={row.id}>
                    <AdminTableCell className="text-xs text-stone-500 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDate(row.createdAt)}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <UTag
                        tone={row.action === 'DELETE' ? 'ember' : row.action === 'CREATE' ? 'sage' : 'stone'}
                        size="sm"
                      >
                        {row.action}
                      </UTag>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <FileText className="size-3.5 text-stone-400" />
                        <span className="font-mono text-xs">{row.entity}</span>
                        {row.entityId ? (
                          <span className="text-xs text-stone-500">#{row.entityId}</span>
                        ) : null}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell className="text-xs">
                      <span className="inline-flex items-center gap-1">
                        <User className="size-3 text-stone-400" />
                        {row.userEmail ?? (row.userId ? `#${row.userId}` : '-')}
                      </span>
                      {row.ip ? <span className="text-stone-400 ml-1">· {row.ip}</span> : null}
                    </AdminTableCell>
                    <AdminTableCell className="max-w-xs">
                      {row.payload ? (
                        <pre className="max-h-16 overflow-auto text-xs font-mono text-stone-600 bg-stone-50 rounded p-1">
                          {JSON.stringify(row.payload).slice(0, 200)}
                        </pre>
                      ) : (
                        <span className="text-xs text-stone-400">—</span>
                      )}
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
          </div>

          <Pagination page={page} totalPages={totalPages} total={total} basePath={basePath} searchQuery={search} />
        </>
      )}
    </div>
  )
}
