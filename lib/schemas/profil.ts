import { z } from 'zod'
import { emailSchema, longText, richText, shortText, urlSchema } from './common'

export const profilUpdateSchema = z.object({
  nama_desa: shortText(200).optional(),
  nama_kecamatan: shortText(200).optional(),
  nama_kabupaten: shortText(200).optional(),
  nama_provinsi: shortText(200).optional(),
  kode_pos: z.string().max(20).optional(),
  jumlah_penduduk: z.coerce.number().int().nonnegative('Jumlah penduduk tidak valid').optional(),
  tahun_berdiri: z.string().max(20).optional(),
  alamat_kantor: shortText(500).optional(),
  telepon: z.string().max(50).optional(),
  email: emailSchema.max(200).optional().or(z.literal('').transform(() => '')),
  whatsapp: z.string().max(50).optional(),
  jam_pelayanan: z.string().max(100).optional(),
  maps_embed_url: longText(2000),
  maps_link: longText(500),
  sejarah_konten: z.union([richText(20000), z.literal('')]).optional(),
  visi: longText(5000),
  misi: longText(10000),
  periode_visi_misi: z.string().max(50).optional(),
})

export type ProfilUpdateInput = z.infer<typeof profilUpdateSchema>
