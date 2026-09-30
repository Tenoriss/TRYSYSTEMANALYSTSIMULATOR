import {
  ArrowLeftRight,
  BookOpen,
  ClipboardList,
  GitBranch,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Network,
  Scale,
  ShieldAlert,
  Target,
  Users,
} from 'lucide-react'
import type { AnalysisStepKey, IconType } from '../types'

export type MethodCategory = Exclude<AnalysisStepKey, 'report'>

export interface MethodCopy {
  title: string
  summary: string
  whenToUse: string
  steps: [string, string, string]
  output: string
  tags: string[]
}

export interface AnalysisMethod {
  id: string
  category: MethodCategory
  step: AnalysisStepKey
  icon: IconType
  copy: Record<'en' | 'id', MethodCopy>
}

/** Curated, bilingual reference guides for common system-analysis techniques. */
export const ANALYSIS_METHODS: AnalysisMethod[] = [
  {
    id: 'stakeholder-map',
    category: 'investigation',
    step: 'investigation',
    icon: Users,
    copy: {
      en: {
        title: 'Stakeholder influence–interest map',
        summary: 'Make the people around a change visible, then plan how to involve each group.',
        whenToUse: 'Use at the start of an initiative, especially when decision-makers, users, and impacted teams have different priorities.',
        steps: [
          'List the people and groups affected by the system or able to shape its direction.',
          'Estimate each stakeholder’s influence and interest; capture their goals, concerns, and evidence.',
          'Choose an engagement approach: manage closely, keep satisfied, keep informed, or monitor.',
        ],
        output: 'A prioritized stakeholder register with clear engagement actions and owners.',
        tags: ['stakeholders', 'influence', 'interest', 'investigation'],
      },
      id: {
        title: 'Peta pengaruh–kepentingan pemangku kepentingan',
        summary: 'Petakan pihak yang terdampak perubahan, lalu rencanakan cara melibatkan tiap kelompok.',
        whenToUse: 'Gunakan di awal inisiatif, terutama ketika pengambil keputusan, pengguna, dan tim terdampak memiliki prioritas berbeda.',
        steps: [
          'Daftar orang dan kelompok yang terdampak oleh sistem atau dapat memengaruhi arahnya.',
          'Perkirakan pengaruh dan kepentingan tiap pihak; catat tujuan, kekhawatiran, dan buktinya.',
          'Tentukan pendekatan keterlibatan: kelola secara dekat, jaga kepuasannya, beri informasi, atau pantau.',
        ],
        output: 'Daftar pemangku kepentingan yang diprioritaskan beserta tindakan dan penanggung jawabnya.',
        tags: ['pemangku kepentingan', 'pengaruh', 'kepentingan', 'investigasi'],
      },
    },
  },
  {
    id: 'semi-structured-interview',
    category: 'investigation',
    step: 'investigation',
    icon: MessageSquare,
    copy: {
      en: {
        title: 'Semi-structured interview',
        summary: 'Combine prepared prompts with follow-up questions to uncover how work really happens.',
        whenToUse: 'Use when you need context, motivations, exceptions, or tacit knowledge that a survey or process document cannot reveal.',
        steps: [
          'Set a learning objective and prepare open questions tied to the stakeholder’s role.',
          'Ask for a recent, specific example; probe for decisions, handoffs, exceptions, and evidence.',
          'Summarize what you heard, check your interpretation, and record follow-up questions.',
        ],
        output: 'Validated interview notes, assumptions to test, and candidate requirements or problems.',
        tags: ['interview', 'questions', 'evidence', 'stakeholders'],
      },
      id: {
        title: 'Wawancara semi-terstruktur',
        summary: 'Gabungkan pertanyaan yang disiapkan dengan pertanyaan lanjutan untuk memahami pekerjaan sebenarnya.',
        whenToUse: 'Gunakan saat Anda perlu memahami konteks, motivasi, pengecualian, atau pengetahuan tacit yang tidak terlihat dari survei atau dokumen proses.',
        steps: [
          'Tentukan tujuan belajar dan siapkan pertanyaan terbuka sesuai peran narasumber.',
          'Minta contoh terbaru yang spesifik; gali keputusan, serah-terima, pengecualian, dan buktinya.',
          'Rangkum jawaban, pastikan tafsiran Anda tepat, lalu catat pertanyaan lanjutan.',
        ],
        output: 'Catatan wawancara tervalidasi, asumsi untuk diuji, serta kandidat kebutuhan atau masalah.',
        tags: ['wawancara', 'pertanyaan', 'bukti', 'pemangku kepentingan'],
      },
    },
  },
  {
    id: 'sipoc',
    category: 'investigation',
    step: 'investigation',
    icon: ClipboardList,
    copy: {
      en: {
        title: 'SIPOC process framing',
        summary: 'Agree on a high-level process boundary before diving into detailed workflow analysis.',
        whenToUse: 'Use when teams disagree about where a process starts or ends, or when the scope is still too broad.',
        steps: [
          'Name the process and define its start trigger and end condition.',
          'Map Suppliers, Inputs, the high-level Process, Outputs, and Customers from left to right.',
          'Validate the boundary and terms with process owners and representative users.',
        ],
        output: 'A one-page scope view that exposes handoffs, inputs, outputs, and key customers.',
        tags: ['process', 'scope', 'suppliers', 'inputs', 'outputs', 'customers'],
      },
      id: {
        title: 'Pembingkaian proses SIPOC',
        summary: 'Sepakati batas proses secara umum sebelum menganalisis alur kerja secara terperinci.',
        whenToUse: 'Gunakan saat tim belum sepakat di mana proses dimulai atau berakhir, atau cakupannya masih terlalu luas.',
        steps: [
          'Beri nama proses dan tentukan pemicu awal serta kondisi akhirnya.',
          'Petakan Supplier, Input, Process, Output, dan Customer dari kiri ke kanan.',
          'Validasi batas dan istilahnya bersama pemilik proses serta perwakilan pengguna.',
        ],
        output: 'Gambaran cakupan satu halaman yang menampilkan serah-terima, masukan, keluaran, dan pelanggan utama.',
        tags: ['proses', 'cakupan', 'pemasok', 'masukan', 'keluaran', 'pelanggan'],
      },
    },
  },
  {
    id: 'five-whys',
    category: 'problems',
    step: 'problems',
    icon: GitBranch,
    copy: {
      en: {
        title: '5 Whys root-cause analysis',
        summary: 'Trace a clearly observed problem through successive causes instead of stopping at a symptom.',
        whenToUse: 'Use for a focused problem with a plausible cause chain. It works best with people who know the process and supporting evidence.',
        steps: [
          'Write a specific, evidence-based problem statement without implying a solution.',
          'Ask why it happened; verify the answer, then repeat for each confirmed cause.',
          'Stop when the team reaches a controllable root cause, and identify how to test or address it.',
        ],
        output: 'A documented cause chain and a root-cause statement linked to evidence.',
        tags: ['root cause', 'five whys', 'problem solving', 'evidence'],
      },
      id: {
        title: 'Analisis akar masalah 5 Whys',
        summary: 'Telusuri masalah yang teramati melalui rangkaian penyebab, bukan berhenti pada gejalanya.',
        whenToUse: 'Gunakan untuk masalah terfokus dengan rantai penyebab yang masuk akal. Libatkan orang yang memahami proses dan bukti pendukung.',
        steps: [
          'Tuliskan masalah yang spesifik dan berbasis bukti tanpa menyisipkan solusi.',
          'Tanyakan mengapa hal itu terjadi; verifikasi jawabannya, lalu ulangi untuk tiap penyebab yang terkonfirmasi.',
          'Berhenti saat tim menemukan akar penyebab yang dapat dikendalikan, lalu tentukan cara menguji atau menanganinya.',
        ],
        output: 'Rantai penyebab yang terdokumentasi dan pernyataan akar masalah yang terhubung dengan bukti.',
        tags: ['akar masalah', 'lima mengapa', 'pemecahan masalah', 'bukti'],
      },
    },
  },
  {
    id: 'fishbone',
    category: 'problems',
    step: 'problems',
    icon: Network,
    copy: {
      en: {
        title: 'Fishbone (Ishikawa) diagram',
        summary: 'Explore several possible cause categories when a problem is too complex for a single cause chain.',
        whenToUse: 'Use with a cross-functional team to broaden root-cause thinking before prioritizing what to investigate.',
        steps: [
          'Put a measurable problem statement at the “head” of the diagram.',
          'Choose relevant cause branches, such as people, process, technology, data, or policy.',
          'Brainstorm evidence-backed causes, then validate and prioritize the most credible ones.',
        ],
        output: 'A structured cause map and a shortlist of hypotheses to verify.',
        tags: ['cause and effect', 'ishikawa', 'root cause', 'brainstorm'],
      },
      id: {
        title: 'Diagram tulang ikan (Ishikawa)',
        summary: 'Jelajahi beberapa kategori penyebab ketika satu rangkaian sebab tidak cukup menjelaskan masalah.',
        whenToUse: 'Gunakan bersama tim lintas fungsi untuk memperluas analisis akar masalah sebelum menentukan hal yang perlu diselidiki.',
        steps: [
          'Letakkan pernyataan masalah yang terukur di bagian “kepala” diagram.',
          'Pilih cabang penyebab yang relevan, seperti manusia, proses, teknologi, data, atau kebijakan.',
          'Diskusikan penyebab yang didukung bukti, lalu validasi dan prioritaskan yang paling masuk akal.',
        ],
        output: 'Peta penyebab yang terstruktur dan daftar hipotesis yang perlu diverifikasi.',
        tags: ['sebab akibat', 'ishikawa', 'akar masalah', 'diskusi'],
      },
    },
  },
  {
    id: 'swot',
    category: 'problems',
    step: 'problems',
    icon: Lightbulb,
    copy: {
      en: {
        title: 'SWOT analysis',
        summary: 'Separate internal strengths and weaknesses from external opportunities and threats.',
        whenToUse: 'Use for an early strategic view of a proposed change, not as a substitute for process evidence or detailed requirements.',
        steps: [
          'Define the decision or system boundary the SWOT is meant to inform.',
          'List internal Strengths and Weaknesses, then external Opportunities and Threats.',
          'Support each item with evidence and turn the most important findings into actions or questions.',
        ],
        output: 'A concise strategic snapshot with evidence-backed implications and open questions.',
        tags: ['strategy', 'strengths', 'weaknesses', 'opportunities', 'threats'],
      },
      id: {
        title: 'Analisis SWOT',
        summary: 'Pisahkan kekuatan dan kelemahan internal dari peluang dan ancaman eksternal.',
        whenToUse: 'Gunakan untuk memahami konteks strategis awal sebuah perubahan, bukan sebagai pengganti bukti proses atau kebutuhan terperinci.',
        steps: [
          'Tentukan keputusan atau batas sistem yang ingin dibantu oleh analisis SWOT.',
          'Daftar Strengths (kekuatan) dan Weaknesses (kelemahan) internal, lalu Opportunities (peluang) dan Threats (ancaman) eksternal.',
          'Dukung tiap butir dengan bukti dan ubah temuan terpenting menjadi tindakan atau pertanyaan.',
        ],
        output: 'Gambaran strategis ringkas beserta implikasi berbasis bukti dan pertanyaan terbuka.',
        tags: ['strategi', 'kekuatan', 'kelemahan', 'peluang', 'ancaman'],
      },
    },
  },
  {
    id: 'moscow',
    category: 'requirements',
    step: 'requirements',
    icon: ListChecks,
    copy: {
      en: {
        title: 'MoSCoW prioritization',
        summary: 'Create a shared, time-bound view of which requirements matter most for a release.',
        whenToUse: 'Use when a backlog is larger than the available time or capacity. Agree on the release boundary first.',
        steps: [
          'Review each requirement with users and the delivery team; clarify value and consequences of omission.',
          'Classify it as Must, Should, Could, or Won’t have for this time-boxed release.',
          'Check that Must haves fit the available capacity and record who agreed to the priorities.',
        ],
        output: 'A negotiated, release-specific priority list with explicit trade-offs.',
        tags: ['requirements', 'priority', 'backlog', 'moscow'],
      },
      id: {
        title: 'Prioritisasi MoSCoW',
        summary: 'Bangun kesepahaman tentang kebutuhan yang paling penting untuk suatu rilis dengan batas waktu tertentu.',
        whenToUse: 'Gunakan saat daftar kebutuhan melebihi waktu atau kapasitas yang tersedia. Sepakati batas rilis terlebih dahulu.',
        steps: [
          'Tinjau tiap kebutuhan bersama pengguna dan tim pelaksana; perjelas nilai serta akibat jika dihilangkan.',
          'Kelompokkan sebagai Must, Should, Could, atau Won’t have untuk rilis berbatas waktu ini.',
          'Pastikan kebutuhan Must sesuai kapasitas dan catat pihak yang menyepakati prioritasnya.',
        ],
        output: 'Daftar prioritas khusus untuk rilis yang dinegosiasikan, lengkap dengan kompromi yang disepakati.',
        tags: ['kebutuhan', 'prioritas', 'backlog', 'moscow'],
      },
    },
  },
  {
    id: 'user-stories',
    category: 'requirements',
    step: 'requirements',
    icon: BookOpen,
    copy: {
      en: {
        title: 'User stories and acceptance criteria',
        summary: 'Describe a user goal and define observable examples that make completion testable.',
        whenToUse: 'Use to discuss user value and behavior in an iterative delivery team. A story is a conversation starter, not the full specification.',
        steps: [
          'Write the user, goal, and value: “As a…, I want…, so that…”.',
          'Add concise acceptance criteria that cover the happy path, important alternatives, and failure cases.',
          'Review examples with users and split the story if it is too large to build and verify in one increment.',
        ],
        output: 'A small, testable requirement with shared examples of expected behavior.',
        tags: ['user story', 'acceptance criteria', 'agile', 'requirements'],
      },
      id: {
        title: 'User story dan kriteria penerimaan',
        summary: 'Jelaskan tujuan pengguna dan tentukan contoh teramati agar penyelesaiannya dapat diuji.',
        whenToUse: 'Gunakan untuk membahas nilai dan perilaku pengguna bersama tim iteratif. User story adalah pemantik diskusi, bukan spesifikasi lengkap.',
        steps: [
          'Tuliskan pengguna, tujuan, dan nilainya: “Sebagai…, saya ingin…, agar…”.',
          'Tambahkan kriteria penerimaan yang ringkas untuk alur normal, alternatif penting, dan kondisi gagal.',
          'Tinjau contoh bersama pengguna dan pecah story jika terlalu besar untuk dibuat serta diverifikasi dalam satu iterasi.',
        ],
        output: 'Kebutuhan kecil yang dapat diuji dengan contoh perilaku yang dipahami bersama.',
        tags: ['user story', 'kriteria penerimaan', 'agile', 'kebutuhan'],
      },
    },
  },
  {
    id: 'use-case',
    category: 'modeling',
    step: 'modeling',
    icon: GitBranch,
    copy: {
      en: {
        title: 'Use-case modeling',
        summary: 'Show how external actors achieve goals through a proposed system.',
        whenToUse: 'Use to clarify system scope, actor goals, and interactions before designing screens or implementation details.',
        steps: [
          'Name the system boundary and identify external actors, including other systems.',
          'Define each actor’s goal as a use case; describe preconditions, main flow, alternatives, and outcomes.',
          'Review the flows with users and check that each goal traces to a requirement or business objective.',
        ],
        output: 'A use-case diagram and concise scenario descriptions that make scope and behavior reviewable.',
        tags: ['uml', 'use case', 'actors', 'system scope'],
      },
      id: {
        title: 'Pemodelan use case',
        summary: 'Gambarkan cara aktor eksternal mencapai tujuan melalui sistem yang diusulkan.',
        whenToUse: 'Gunakan untuk memperjelas cakupan sistem, tujuan aktor, dan interaksi sebelum merancang layar atau detail implementasi.',
        steps: [
          'Tentukan batas sistem dan identifikasi aktor eksternal, termasuk sistem lain.',
          'Jelaskan tujuan tiap aktor sebagai use case; uraikan prasyarat, alur utama, alternatif, dan hasilnya.',
          'Tinjau alur bersama pengguna dan pastikan tiap tujuan dapat ditelusuri ke kebutuhan atau sasaran bisnis.',
        ],
        output: 'Diagram use case dan deskripsi skenario ringkas agar cakupan serta perilaku mudah ditinjau.',
        tags: ['uml', 'use case', 'aktor', 'cakupan sistem'],
      },
    },
  },
  {
    id: 'as-is-to-be',
    category: 'modeling',
    step: 'modeling',
    icon: ArrowLeftRight,
    copy: {
      en: {
        title: 'AS-IS / TO-BE process analysis',
        summary: 'Compare today’s evidence-based workflow with a measurable, proposed future state.',
        whenToUse: 'Use when the proposed system changes how work flows across people, teams, or existing tools.',
        steps: [
          'Map the AS-IS process from trigger to outcome, including handoffs, tools, delays, and workarounds.',
          'Design the TO-BE flow around user and business outcomes; make roles and system responsibilities explicit.',
          'Compare the two states, validate assumptions, and identify gaps, dependencies, and transition risks.',
        ],
        output: 'A current/future process comparison with measurable improvements and change impacts.',
        tags: ['process', 'as-is', 'to-be', 'workflow', 'gap analysis'],
      },
      id: {
        title: 'Analisis proses AS-IS / TO-BE',
        summary: 'Bandingkan alur kerja saat ini yang berbasis bukti dengan kondisi masa depan yang terukur.',
        whenToUse: 'Gunakan saat sistem yang diusulkan mengubah alur kerja antarorang, tim, atau alat yang sudah ada.',
        steps: [
          'Petakan proses AS-IS dari pemicu hingga hasil, termasuk serah-terima, alat, keterlambatan, dan jalan pintas.',
          'Rancang alur TO-BE berdasarkan hasil bagi pengguna dan bisnis; perjelas peran serta tanggung jawab sistem.',
          'Bandingkan kedua kondisi, validasi asumsi, lalu identifikasi kesenjangan, ketergantungan, dan risiko transisi.',
        ],
        output: 'Perbandingan proses saat ini dan masa depan beserta perbaikan terukur dan dampak perubahannya.',
        tags: ['proses', 'as-is', 'to-be', 'alur kerja', 'analisis kesenjangan'],
      },
    },
  },
  {
    id: 'impact-effort',
    category: 'solution',
    step: 'solution',
    icon: Target,
    copy: {
      en: {
        title: 'Impact–effort matrix',
        summary: 'Compare candidate features by expected value and delivery effort to support sequencing.',
        whenToUse: 'Use during solution planning when several options compete for limited delivery capacity.',
        steps: [
          'Agree on what “impact” means for this decision, such as risk reduction, time saved, or user reach.',
          'Estimate impact and effort with the people who understand users and delivery constraints.',
          'Discuss high-impact, low-effort candidates first; record dependencies and uncertainty rather than treating the grid as a promise.',
        ],
        output: 'A transparent discussion aid for sequencing options, with assumptions and dependencies visible.',
        tags: ['prioritization', 'impact', 'effort', 'features'],
      },
      id: {
        title: 'Matriks dampak–upaya',
        summary: 'Bandingkan fitur kandidat berdasarkan nilai yang diharapkan dan upaya pengerjaan untuk menentukan urutan.',
        whenToUse: 'Gunakan saat merencanakan solusi dan beberapa opsi bersaing memperebutkan kapasitas tim yang terbatas.',
        steps: [
          'Sepakati arti “dampak” untuk keputusan ini, misalnya pengurangan risiko, penghematan waktu, atau jangkauan pengguna.',
          'Perkirakan dampak dan upaya bersama pihak yang memahami pengguna serta batasan pelaksanaan.',
          'Bahas kandidat berdampak tinggi dan berupaya rendah terlebih dahulu; catat ketergantungan dan ketidakpastian.',
        ],
        output: 'Alat diskusi yang transparan untuk mengurutkan opsi dengan asumsi dan ketergantungan yang terlihat.',
        tags: ['prioritas', 'dampak', 'upaya', 'fitur'],
      },
    },
  },
  {
    id: 'risk-matrix',
    category: 'solution',
    step: 'solution',
    icon: ShieldAlert,
    copy: {
      en: {
        title: 'Risk probability–impact matrix',
        summary: 'Make uncertainty visible and focus mitigation on risks that could materially affect outcomes.',
        whenToUse: 'Use when comparing solution options or planning rollout, migration, adoption, and operational changes.',
        steps: [
          'Describe each risk as a cause, uncertain event, and consequence; assign an owner.',
          'Estimate probability and impact using agreed scales, and note the evidence behind each estimate.',
          'Prioritize responses, define a practical mitigation or contingency, and revisit the register as evidence changes.',
        ],
        output: 'An owned risk register with priority, mitigation, and clear review triggers.',
        tags: ['risk', 'probability', 'impact', 'mitigation'],
      },
      id: {
        title: 'Matriks probabilitas–dampak risiko',
        summary: 'Tampilkan ketidakpastian dan fokuskan mitigasi pada risiko yang dapat memengaruhi hasil secara berarti.',
        whenToUse: 'Gunakan saat membandingkan opsi solusi atau merencanakan peluncuran, migrasi, adopsi, dan perubahan operasional.',
        steps: [
          'Jelaskan tiap risiko sebagai penyebab, peristiwa yang belum pasti, dan konsekuensinya; tetapkan pemilik.',
          'Perkirakan probabilitas dan dampak dengan skala yang disepakati, lalu catat bukti di balik estimasi.',
          'Prioritaskan respons, tentukan mitigasi atau rencana cadangan, dan tinjau ulang saat bukti berubah.',
        ],
        output: 'Daftar risiko dengan pemilik, prioritas, mitigasi, dan pemicu tinjauan yang jelas.',
        tags: ['risiko', 'probabilitas', 'dampak', 'mitigasi'],
      },
    },
  },
  {
    id: 'weighted-decision-matrix',
    category: 'evaluation',
    step: 'evaluation',
    icon: Scale,
    copy: {
      en: {
        title: 'Weighted decision matrix',
        summary: 'Compare alternatives against explicit criteria when no single option wins on every dimension.',
        whenToUse: 'Use to evaluate solution approaches with multiple stakeholders, while keeping value judgments visible.',
        steps: [
          'Choose decision criteria that reflect objectives and constraints; agree on their relative weights.',
          'Score each alternative against the criteria using evidence and a consistent scale.',
          'Review sensitivity: change uncertain weights or scores and discuss whether the preferred option changes.',
        ],
        output: 'A documented comparison that supports a decision without hiding assumptions behind one score.',
        tags: ['evaluation', 'decision', 'weighted scoring', 'alternatives'],
      },
      id: {
        title: 'Matriks keputusan berbobot',
        summary: 'Bandingkan alternatif dengan kriteria yang eksplisit ketika tidak ada satu opsi yang unggul di semua sisi.',
        whenToUse: 'Gunakan untuk mengevaluasi pendekatan solusi bersama beberapa pemangku kepentingan sambil memperjelas pertimbangan nilai.',
        steps: [
          'Pilih kriteria keputusan yang mencerminkan sasaran dan batasan; sepakati bobot relatifnya.',
          'Beri skor pada tiap alternatif berdasarkan kriteria dengan bukti dan skala yang konsisten.',
          'Uji sensitivitas: ubah bobot atau skor yang belum pasti dan bahas apakah opsi pilihan ikut berubah.',
        ],
        output: 'Perbandingan terdokumentasi yang mendukung keputusan tanpa menyembunyikan asumsi di balik satu skor.',
        tags: ['evaluasi', 'keputusan', 'skor berbobot', 'alternatif'],
      },
    },
  },
]
