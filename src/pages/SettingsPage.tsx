import { ArrowRight, Check, Download, Trash2, Upload } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSchemeSetting, useAppSetting } from '../hooks/useSettings'
import { saveSchemeSetting, saveAppSetting } from '../db/settingRepository'
import { getAllPurchases, clearAllPurchases } from '../db/purchaseRepository'
import { db } from '../db/db'
import { DEFAULT_SCHEME } from '../types/setting'
import { ImportFileError, createPurchasesCsv, createPurchasesXlsxBlob, parsePurchasesFile } from '../logic/dataPortability'
import ConfirmDialog from '../components/ConfirmDialog'
import type { PurchaseEntry } from '../types/purchase'

export default function SettingsPage() {
  const navigate = useNavigate()
  const scheme = useSchemeSetting()
  const appSetting = useAppSetting()

  const [subsidyRate, setSubsidyRate] = useState('')
  const [dailyCap, setDailyCap] = useState('')
  const [monthlyCap, setMonthlyCap] = useState('')
  const [totalCap, setTotalCap] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [fontSizeMode, setFontSizeMode] = useState<'normal' | 'large' | 'extra-large'>('normal')
  const [saved, setSaved] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showClearConfirm2, setShowClearConfirm2] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSubsidyRate(String(scheme.subsidyRate * 100))
    setDailyCap(String(scheme.dailyCap))
    setMonthlyCap(String(scheme.monthlyCap))
    setTotalCap(String(scheme.totalCap))
    setStartDate(scheme.startDate ?? '')
    setEndDate(scheme.endDate ?? '')
  }, [scheme])

  useEffect(() => {
    setFontSizeMode(appSetting.fontSizeMode)
  }, [appSetting])

  async function handleSaveScheme() {
    await saveSchemeSetting({
      subsidyRate: parseFloat(subsidyRate) / 100 || 0.6,
      dailyCap: parseFloat(dailyCap) || 200,
      monthlyCap: parseFloat(monthlyCap) || 1000,
      totalCap: parseFloat(totalCap) || 4000,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      currency: 'THB',
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleResetScheme() {
    setSubsidyRate(String(DEFAULT_SCHEME.subsidyRate * 100))
    setDailyCap(String(DEFAULT_SCHEME.dailyCap))
    setMonthlyCap(String(DEFAULT_SCHEME.monthlyCap))
    setTotalCap(String(DEFAULT_SCHEME.totalCap))
    setStartDate(DEFAULT_SCHEME.startDate ?? '')
    setEndDate(DEFAULT_SCHEME.endDate ?? '')
  }

  async function handleSaveFontSize() {
    await saveAppSetting({ ...appSetting, fontSizeMode })
  }

  function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleExportJson() {
    const purchases = await getAllPurchases()
    const schemeData = await db.settings.get('scheme')
    const appData = await db.settings.get('app')
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      purchases,
      settings: { scheme: schemeData?.value, app: appData?.value },
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `jod-lakhrueng-backup-${new Date().toISOString().slice(0, 10)}.json`)
  }

  async function handleExportXlsx() {
    const purchases = await getAllPurchases()
    const blob = await createPurchasesXlsxBlob(purchases, scheme)
    downloadBlob(blob, `jod-lakhrueng-purchases-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  async function handleExportCsv() {
    const purchases = await getAllPurchases()
    const csv = createPurchasesCsv(purchases, scheme)
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    downloadBlob(blob, `jod-lakhrueng-purchases-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      if (file.name.toLowerCase().endsWith('.json')) {
        const data = JSON.parse(await file.text())
        if (!data.purchases || !Array.isArray(data.purchases)) {
          alert('ไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์สำรองข้อมูลที่ถูกต้อง')
          return
        }
        await db.purchases.bulkPut(data.purchases as PurchaseEntry[])
        if (data.settings?.scheme) await db.settings.put({ key: 'scheme', value: data.settings.scheme })
        if (data.settings?.app) await db.settings.put({ key: 'app', value: data.settings.app })
        alert(`นำข้อมูลกลับมาแล้ว ${data.purchases.length} รายการ`)
      } else {
        const purchases = await parsePurchasesFile(file)
        if (purchases.length === 0) {
          alert('ไม่พบรายการซื้อในไฟล์นี้')
          return
        }
        await db.purchases.bulkPut(purchases)
        alert(`นำรายการจากไฟล์ตารางแล้ว ${purchases.length} รายการ`)
      }
    } catch (error) {
      alert(getImportErrorMessage(error))
    }
    e.target.value = ''
  }

  function getImportErrorMessage(error: unknown): string {
    if (error instanceof ImportFileError) {
      if (error.code === 'unsupported-file-type') return 'ยังไม่รองรับไฟล์ชนิดนี้ กรุณาเลือกไฟล์ .json, .xlsx หรือ .csv'
      if (error.code === 'unreadable-file') return 'อ่านไฟล์นี้ไม่ได้ กรุณาตรวจว่าไฟล์ไม่เสียหาย และลองส่งออกไฟล์ใหม่อีกครั้ง'
      if (error.code === 'invalid-csv') return 'ไฟล์ CSV ไม่ถูกต้อง กรุณาตรวจเครื่องหมายคำพูดและรูปแบบตาราง'
      if (error.code === 'invalid-row') return `ข้อมูลแถวที่ ${error.rowNumber ?? '-'} ไม่ครบ กรุณาตรวจวันที่และยอดซื้อ`
    }
    if (error instanceof SyntaxError) return 'ไฟล์ JSON ไม่ถูกต้อง กรุณาเลือกไฟล์สำรองข้อมูลที่ส่งออกจากแอป'
    return 'เกิดข้อผิดพลาด ไม่สามารถนำข้อมูลกลับมาได้ กรุณาตรวจรูปแบบไฟล์'
  }

  async function handleClearAll() {
    await clearAllPurchases()
    setShowClearConfirm2(false)
  }

  const inputClass = 'w-full text-lg border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none'
  const labelClass = 'text-base text-gray-500 block mb-1'
  const sectionClass = 'bg-white rounded-2xl p-5 border border-gray-200 space-y-4'

  return (
    <div className="max-w-md mx-auto">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">ตั้งค่า</h1>
        <p className="text-sm text-gray-400 mt-1">ถ้ารัฐเปลี่ยนกติกา คุณสามารถแก้ตัวเลขตรงนี้ได้เอง</p>
      </header>

      <div className="px-4 space-y-5 pb-28">
        <div className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-700">กติกาโครงการ</h2>

          <div>
            <label htmlFor="subsidyRate" className={labelClass}>รัฐช่วยกี่เปอร์เซ็นต์</label>
            <div className="relative">
              <input id="subsidyRate" type="number" value={subsidyRate} onChange={(e) => setSubsidyRate(e.target.value)} className={inputClass} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
            </div>
          </div>

          <div>
            <label htmlFor="dailyCap" className={labelClass}>รัฐช่วยสูงสุดต่อวัน</label>
            <div className="relative">
              <input id="dailyCap" type="number" value={dailyCap} onChange={(e) => setDailyCap(e.target.value)} className={inputClass} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">บาท</span>
            </div>
          </div>

          <div>
            <label htmlFor="monthlyCap" className={labelClass}>รัฐช่วยสูงสุดต่อเดือน</label>
            <div className="relative">
              <input id="monthlyCap" type="number" value={monthlyCap} onChange={(e) => setMonthlyCap(e.target.value)} className={inputClass} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">บาท</span>
            </div>
          </div>

          <div>
            <label htmlFor="totalCap" className={labelClass}>วงเงินรวมตลอดโครงการ</label>
            <div className="relative">
              <input id="totalCap" type="number" value={totalCap} onChange={(e) => setTotalCap(e.target.value)} className={inputClass} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">บาท</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">ไทยช่วยไทย พลัส: 4,000 บาท ตลอดโครงการ</p>
          </div>

          <div>
            <label htmlFor="startDate" className={labelClass}>วันเริ่มโครงการ</label>
            <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="endDate" className={labelClass}>วันสิ้นสุดโครงการ (ไม่บังคับ)</label>
            <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleResetScheme} className="flex-1 border-2 border-gray-300 text-gray-600 text-base font-medium py-3 rounded-xl min-h-[48px] active:scale-[0.97] transition-transform duration-100">
              คืนค่าเริ่มต้น
            </button>
            <button onClick={handleSaveScheme} className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 text-white text-base font-semibold py-3 rounded-xl min-h-[48px] active:scale-[0.95] transition-transform duration-100">
              {saved && <Check className="h-5 w-5" aria-hidden="true" />}
              {saved ? 'บันทึกแล้ว' : 'บันทึก'}
            </button>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-700">ขนาดตัวอักษร</h2>
          <div className="flex gap-2">
            {(['normal', 'large', 'extra-large'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFontSizeMode(mode)}
                className={`flex-1 py-3 rounded-xl border-2 text-base font-medium min-h-[48px] active:scale-[0.97] transition-transform duration-100 ${fontSizeMode === mode ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}
              >
                {mode === 'normal' ? 'ปกติ' : mode === 'large' ? 'ใหญ่' : 'ใหญ่มาก'}
              </button>
            ))}
          </div>
          <button onClick={handleSaveFontSize} className="w-full bg-green-600 text-white text-base font-semibold py-3 rounded-xl min-h-[48px] active:scale-[0.95] transition-transform duration-100">
            บันทึกขนาดตัวอักษร
          </button>
        </div>

        <div className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-700">ข้อมูล</h2>
          <p className="text-base text-gray-500">ข้อมูลทั้งหมดเก็บอยู่ในเครื่องนี้เท่านั้น แนะนำสำรองข้อมูลเป็นประจำ</p>

          <button onClick={handleExportJson} className="w-full inline-flex items-center justify-center gap-2 border-2 border-green-200 text-green-700 text-base font-medium py-3 rounded-xl min-h-[48px] active:scale-[0.97] transition-transform duration-100">
            <Download className="h-5 w-5" aria-hidden="true" />
            สำรองข้อมูล (JSON)
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleExportXlsx} className="inline-flex items-center justify-center gap-2 border-2 border-green-200 text-green-700 text-base font-medium py-3 rounded-xl min-h-[48px] active:scale-[0.97] transition-transform duration-100">
              <Download className="h-5 w-5" aria-hidden="true" />
              Export Excel
            </button>
            <button onClick={handleExportCsv} className="inline-flex items-center justify-center gap-2 border-2 border-green-200 text-green-700 text-base font-medium py-3 rounded-xl min-h-[48px] active:scale-[0.97] transition-transform duration-100">
              <Download className="h-5 w-5" aria-hidden="true" />
              Export CSV
            </button>
          </div>
          <p className="text-sm text-gray-400">Excel/CSV จะส่งออกเฉพาะรายการซื้อ เหมาะสำหรับนำไปจดรายรับรายจ่ายต่อ</p>

          <button onClick={() => importRef.current?.click()} className="w-full inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 text-base font-medium py-3 rounded-xl min-h-[48px] active:scale-[0.97] transition-transform duration-100">
            <Upload className="h-5 w-5" aria-hidden="true" />
            นำเข้า JSON / Excel / CSV
          </button>
          <input ref={importRef} type="file" accept=".json,.xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleImport} className="hidden" aria-label="นำเข้าไฟล์ข้อมูล" />

          <button onClick={() => setShowClearConfirm(true)} className="w-full inline-flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 text-base font-medium py-3 rounded-xl min-h-[48px] active:scale-[0.97] transition-transform duration-100">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
            ล้างข้อมูลทั้งหมด
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/privacy')} className="inline-flex items-center justify-center gap-1 text-center text-green-600 text-base py-3 active:scale-[0.97] transition-transform duration-100">
            นโยบายความเป็นส่วนตัว
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button onClick={() => navigate('/terms')} className="inline-flex items-center justify-center gap-1 text-center text-green-600 text-base py-3 active:scale-[0.97] transition-transform duration-100">
            เงื่อนไขการใช้
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          เวอร์ชัน {__APP_VERSION__} ({__APP_BUILD_ID__.slice(0, 7)})
        </p>
      </div>

      {showClearConfirm && (
        <ConfirmDialog
          message="ล้างข้อมูลทั้งหมด?"
          subMessage="รายการซื้อทั้งหมดจะถูกลบถาวร ไม่สามารถกู้คืนได้"
          confirmLabel="ล้างข้อมูล"
          cancelLabel="ยกเลิก"
          confirmVariant="danger"
          onConfirm={() => { setShowClearConfirm(false); setShowClearConfirm2(true) }}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
      {showClearConfirm2 && (
        <ConfirmDialog
          message="ยืนยันอีกครั้ง?"
          subMessage="ข้อมูลทั้งหมดจะหายไปถาวร"
          confirmLabel="ยืนยัน ลบเลย"
          cancelLabel="ยกเลิก"
          confirmVariant="danger"
          onConfirm={handleClearAll}
          onCancel={() => setShowClearConfirm2(false)}
        />
      )}
    </div>
  )
}
