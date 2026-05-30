import { useNavigate } from 'react-router-dom'

export default function PrivacyPage() {
  const navigate = useNavigate()
  return (
    <div className="max-w-md mx-auto">
      <header className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="text-2xl p-2 -ml-2 text-gray-600" aria-label="ย้อนกลับ">←</button>
        <h1 className="text-2xl font-bold text-gray-800">นโยบายความเป็นส่วนตัว</h1>
      </header>

      <div className="px-4 pb-8 space-y-5 text-lg text-gray-700 leading-relaxed">
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
          <p className="font-semibold text-blue-800 text-xl mb-2">ข้อมูลของคุณอยู่ในเครื่องนี้เท่านั้น</p>
          <p>เราไม่เห็น ไม่เก็บ และไม่ส่งข้อมูลรายการซื้อของคุณไปที่ server ใดๆ ทั้งสิ้น</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">เราไม่มี</h2>
          <ul className="space-y-2 text-gray-600">
            <li>✕ ระบบ login หรือสมัครสมาชิก</li>
            <li>✕ การเก็บข้อมูลบน server</li>
            <li>✕ การติดตามพฤติกรรมผู้ใช้</li>
            <li>✕ โฆษณา หรือ third-party tracker</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">ข้อมูลเก็บที่ไหน?</h2>
          <p className="text-gray-600">รายการซื้อและการตั้งค่าทั้งหมดเก็บไว้ใน browser ของเครื่องนี้เท่านั้น ถ้าล้าง browser หรือเปลี่ยนเครื่อง ข้อมูลอาจหาย แนะนำสำรองข้อมูลเป็นประจำที่หน้าตั้งค่า</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">เว็บนี้ไม่ใช่เว็บทางการ</h2>
          <p className="text-gray-600">จดละครึ่ง พลัส เป็นเครื่องมือช่วยจดส่วนตัว พัฒนาขึ้นเพื่อความสนุกและเพื่อแก้ปัญหาที่พบในชีวิตจริง ไม่ใช่เว็บไซต์ทางการของหน่วยงานรัฐหรือของโครงการไทยช่วยไทย พลัส (60/40)</p>
        </div>
      </div>
    </div>
  )
}
