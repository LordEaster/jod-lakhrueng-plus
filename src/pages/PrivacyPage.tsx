import { ArrowLeft, CircleX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PrivacyPage() {
  const navigate = useNavigate()
  return (
    <div className="max-w-md mx-auto">
      <header className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600" aria-label="ย้อนกลับ">
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </button>
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
            <li className="flex items-start gap-2">
              <CircleX className="mt-1 h-5 w-5 flex-shrink-0 text-red-500" aria-hidden="true" />
              <span>ระบบ login หรือสมัครสมาชิก</span>
            </li>
            <li className="flex items-start gap-2">
              <CircleX className="mt-1 h-5 w-5 flex-shrink-0 text-red-500" aria-hidden="true" />
              <span>การเก็บข้อมูลบน server</span>
            </li>
            <li className="flex items-start gap-2">
              <CircleX className="mt-1 h-5 w-5 flex-shrink-0 text-red-500" aria-hidden="true" />
              <span>การติดตามพฤติกรรมผู้ใช้</span>
            </li>
            <li className="flex items-start gap-2">
              <CircleX className="mt-1 h-5 w-5 flex-shrink-0 text-red-500" aria-hidden="true" />
              <span>โฆษณา, analytics, หรือ third-party tracker ที่ฝังในแอป</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">บริการภายนอกที่เกี่ยวข้องกับการโฮสต์</h2>
          <p className="text-gray-600">
            แอปนี้โฮสต์บน GitHub Pages และให้บริการผ่าน Cloudflare เท่านั้น
            เราไม่ได้ฝังบริการ third-party เพื่อเก็บพฤติกรรมผู้ใช้, แต่ผู้ให้บริการโฮสต์อาจมีการเก็บบันทึกทางเทคนิค เช่น IP address,
            user agent, หรือข้อมูลการเข้าถึง ตามนโยบายของผู้ให้บริการนั้นๆ
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">ข้อมูลเก็บที่ไหน?</h2>
          <p className="text-gray-600">
            รายการซื้อและการตั้งค่าทั้งหมดเก็บไว้ใน browser ของเครื่องนี้เท่านั้น ถ้าล้าง browser หรือเปลี่ยนเครื่อง ข้อมูลอาจหาย
            แนะนำสำรองข้อมูลเป็นประจำที่หน้าตั้งค่า เมื่อคุณส่งออกข้อมูลหรือคัดลอกไฟล์ออกจากเครื่องนั้น ข้อมูลจะอยู่ภายใต้การควบคุมของคุณเอง
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">สิทธิและการติดต่อเกี่ยวกับข้อมูล</h2>
          <p className="text-gray-600">
            เนื่องจากแอปนี้ไม่ได้เก็บข้อมูลส่วนตัวไว้บนเซิร์ฟเวอร์ของเรา เราจึงไม่สามารถเข้าถึง แก้ไข หรือลบข้อมูลใน browser ของคุณจากระยะไกลได้
            หากต้องการจัดการข้อมูล ให้ทำผ่าน browser หรือเครื่องของคุณโดยตรง ส่วนบันทึกทางเทคนิคของ GitHub Pages และ Cloudflare จะอยู่ภายใต้นโยบายของผู้ให้บริการเหล่านั้น
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">เว็บนี้ไม่ใช่เว็บทางการ</h2>
          <p className="text-gray-600">จดละครึ่ง พลัส เป็นเครื่องมือช่วยจดส่วนตัว พัฒนาขึ้นเพื่อความสนุกและเพื่อแก้ปัญหาที่พบในชีวิตจริง ไม่ใช่เว็บไซต์ทางการของหน่วยงานรัฐหรือของโครงการไทยช่วยไทย พลัส (60/40)</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">การเปลี่ยนแปลงนโยบาย</h2>
          <p className="text-gray-600">
            เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เมื่อมีการเปลี่ยนแปลงฟีเจอร์หรือข้อกำหนดทางกฎหมาย
            หากใช้งานต่อหลังจากมีการแก้ไข ให้ถือว่าคุณรับทราบนโยบายฉบับล่าสุดแล้ว
          </p>
        </div>
      </div>
    </div>
  )
}
