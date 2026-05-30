import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const updatedAt = '30 พฤษภาคม 2569'

export default function TermsPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-md mx-auto">
      <header className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600" aria-label="ย้อนกลับ">
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">เงื่อนไขการใช้</h1>
          <p className="text-sm text-gray-400">มีผลใช้บังคับ: {updatedAt}</p>
        </div>
      </header>

      <div className="px-4 pb-8 space-y-5 text-base text-gray-700 leading-relaxed">
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950">
          <h2 className="mb-2 text-xl font-semibold">เว็บนี้ไม่ใช่เว็บทางการ</h2>
          <p>
            จดละครึ่ง พลัส เป็นเครื่องมือช่วยจดส่วนตัว ไม่ใช่เว็บไซต์ แอป
            หรือบริการอย่างเป็นทางการของหน่วยงานรัฐหรือโครงการไทยช่วยไทย พลัส (60/40)
            และไม่ได้รับการรับรอง สนับสนุน หรือมอบหมายจากหน่วยงานใด
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">การใช้งาน</h2>
          <p>
            คุณเป็นผู้กรอก แก้ไข นำเข้า ส่งออก และลบข้อมูลของตนเอง
            โปรดตรวจสอบความถูกต้องของยอดเงิน วันที่ และสูตรที่ตั้งไว้ก่อนนำไปใช้อ้างอิง
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">ความถูกต้องของการคำนวณ</h2>
          <p>
            ผลคำนวณเป็นการประมาณจากข้อมูลและกติกาที่ผู้ใช้ตั้งไว้ ไม่ใช่การยืนยันสิทธิ
            ยอดเงิน สถานะโครงการ หรือข้อมูลจากหน่วยงานใด และไม่ใช่คำแนะนำทางการเงิน
            ภาษี บัญชี หรือกฎหมาย
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">ข้อมูลและความปลอดภัย</h2>
          <p>
            ข้อมูลในแอปเก็บในเบราว์เซอร์ของอุปกรณ์นี้เป็นหลัก
            หากใช้อุปกรณ์ร่วมกับผู้อื่น บุคคลที่เข้าถึงเบราว์เซอร์เดียวกันอาจเห็นข้อมูลได้
            โปรดใช้รหัสผ่านอุปกรณ์และส่งออกไฟล์อย่างระมัดระวัง
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">ข้อมูลส่วนบุคคลและ PDPA</h2>
          <p>
            แอปนี้ไม่ได้ออกแบบมาเพื่อเก็บข้อมูลส่วนบุคคลบนเซิร์ฟเวอร์ของผู้ให้บริการ
            ข้อมูลที่คุณกรอก เช่น รายการซื้อ วันที่ หรือยอดเงิน จะถูกจัดเก็บในอุปกรณ์หรือเบราว์เซอร์ของคุณเป็นหลัก
            หากคุณนำเข้าหรือบันทึกข้อมูลที่มีข้อมูลของบุคคลอื่น คุณมีหน้าที่ตรวจสอบว่าได้รับสิทธิหรือความยินยอมที่เหมาะสมแล้ว
            และต้องปฏิบัติตามกฎหมายคุ้มครองข้อมูลส่วนบุคคลที่เกี่ยวข้อง รวมถึง PDPA ของประเทศไทย
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">ข้อห้าม</h2>
          <p>
            ห้ามใช้แอปหรือชื่อแอปเพื่อแอบอ้างว่าเป็นบริการของรัฐ หลอกลวงผู้อื่น
            เก็บข้อมูลของผู้อื่นโดยไม่มีสิทธิ หรือใช้งานที่ฝ่าฝืนกฎหมายไทย
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">ความรับผิด</h2>
          <p>
            ผู้ให้บริการไม่รับประกันว่าแอปจะไม่มีข้อผิดพลาดหรือข้อมูลจะไม่สูญหาย
            คุณควรสำรองข้อมูลด้วยตนเองเป็นระยะ และตรวจสอบข้อมูลกับแหล่งทางการเมื่อมีผลต่อสิทธิ
            การเงิน ภาษี หรือการตัดสินใจสำคัญ การตัดสินใจที่อาศัยข้อมูลจากแอปนี้เป็นความเสี่ยงของผู้ใช้เอง
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">การเปลี่ยนแปลงเงื่อนไข</h2>
          <p>
            ผู้ให้บริการอาจปรับปรุงเงื่อนไขการใช้นี้เป็นครั้งคราวเพื่อให้สอดคล้องกับการใช้งานจริงหรือข้อกฎหมายที่เกี่ยวข้อง
            เมื่อมีการเปลี่ยนแปลงและคุณยังใช้งานต่อไป ให้ถือว่าคุณยอมรับเงื่อนไขฉบับที่แก้ไขแล้ว
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">กฎหมายที่ใช้บังคับ</h2>
          <p>
            เงื่อนไขนี้อยู่ภายใต้กฎหมายของราชอาณาจักรไทย
            หากต้องการติดต่อหรือสอบถามเพิ่มเติม สามารถดูข้อมูลได้ที่
            <a
              href="https://github.com/LordEaster/jod-lakhrueng-plus"
              target="_blank"
              rel="noreferrer"
              className="ml-1 inline-flex items-center gap-1 font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 transition hover:text-gray-600 hover:decoration-gray-500"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              GitHub repo
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
