import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const materialDir = path.join(root, "materials", "cloud-storage");
const interactivePath = path.join(materialDir, "interactive-tabs.html");
const notesPath = path.join(materialDir, "speaker-notes.html");
const markdownPath = path.join(materialDir, "cloud-storage-lecture-speaker-notes.md");

const categories = [
  { id: "intro", label: "처음 이해하기", range: "01-10", accent: "#2f6df6" },
  { id: "implementation", label: "웹 서비스 구현", range: "11-16", accent: "#0f9f8f" },
  { id: "cs", label: "컴공 기본 모델", range: "17-24", accent: "#7458f4" },
  { id: "aws", label: "AWS S3", range: "25-34", accent: "#f59e0b" },
  { id: "azure", label: "Azure Blob", range: "35-44", accent: "#2563eb" },
  { id: "gcp", label: "Google Cloud Storage", range: "45-54", accent: "#22a77a" },
  { id: "ops", label: "운영 심화", range: "55-64", accent: "#dc5f45" }
];

const sourceLinks = {
  aws: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
  awsClasses: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html",
  awsLifecycle: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html",
  awsMultipart: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html",
  awsObjectLock: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html",
  awsStorageLens: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage_lens.html",
  azureIntro: "https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction",
  azureAccount: "https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview",
  azureTiers: "https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview",
  azureRedundancy: "https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy",
  azureReplication: "https://learn.microsoft.com/en-us/azure/storage/blobs/object-replication-overview",
  azureSecurity: "https://learn.microsoft.com/en-us/azure/storage/blobs/security-recommendations",
  azureArchitecture: "https://learn.microsoft.com/en-us/azure/well-architected/service-guides/azure-blob-storage",
  gcsIntro: "https://cloud.google.com/storage/docs/introduction",
  gcsClasses: "https://cloud.google.com/storage/docs/storage-classes",
  gcsLifecycle: "https://cloud.google.com/storage/docs/lifecycle",
  gcsAutoclass: "https://cloud.google.com/storage/docs/autoclass",
  gcsVersioning: "https://cloud.google.com/storage/docs/object-versioning",
  gcsPubSub: "https://cloud.google.com/storage/docs/reporting-changes",
  gcsRetention: "https://cloud.google.com/storage/docs/using-bucket-lock",
  gcsInsights: "https://cloud.google.com/storage/docs/insights/datasets"
};

function flow(title, items) {
  return { type: "flow", title, items };
}

function cards(title, items) {
  return { type: "cards", title, items };
}

function table(title, headers, rows) {
  return { type: "table", title, headers, rows };
}

function matrix(title, items) {
  return { type: "matrix", title, items };
}

function timeline(title, items) {
  return { type: "timeline", title, items };
}

function kv(title, items) {
  return { type: "kv", title, items };
}

function slide(no, cat, title, claim, points, field, visual, source, links = []) {
  return { no, cat, minutes: 5, title, claim, points, field, visual, source, links };
}

const introSlides = [
  slide(1, "intro", "클라우드 스토리지는 인터넷 너머의 개인 창고처럼 시작한다",
    "처음에는 '내 컴퓨터 밖에 파일을 안전하게 맡기는 서비스'로 이해하면 됩니다.",
    [
      "휴대폰 사진을 Google Drive나 iCloud에 올리면 내 기기가 꺼져도 다른 기기에서 다시 볼 수 있습니다.",
      "중요한 차이는 파일이 한 서버의 폴더에만 놓이는 것이 아니라, 제공자의 데이터센터 안에서 여러 장치와 정책으로 관리된다는 점입니다.",
      "사용자는 업로드, 다운로드, 공유, 삭제라는 쉬운 동작으로 보지만 개발자는 인증, 주소, 복제, 비용, 감사 로그까지 함께 설계합니다."
    ],
    "입문 설명은 '인터넷 폴더'에서 시작해도 됩니다. 다만 컴공 관점에서는 그 폴더가 실제 폴더가 아니라 API, 권한, 내구성, 과금 모델을 가진 분산 저장 시스템이라는 데서 공부가 시작됩니다.",
    flow("User view", [["Upload", "내 기기에서 보냄"], ["Store", "클라우드가 보관"], ["Access", "다른 기기와 앱에서 읽음"], ["Delete", "필요 없을 때 정리"]]),
    "AWS S3 User Guide; Azure Blob Storage introduction; Google Cloud Storage overview",
    ["aws", "azureIntro", "gcsIntro"]),

  slide(2, "intro", "왜 그냥 서버 하드디스크에 저장하지 않을까",
    "서비스가 커지면 디스크 하나의 용량, 장애, 백업, 권한 관리가 곧 한계가 됩니다.",
    [
      "서버 한 대에 이미지를 저장하면 서버 교체, 디스크 고장, 배포 중 삭제 실수, 트래픽 폭증을 모두 직접 책임져야 합니다.",
      "클라우드 스토리지는 저장 기능을 애플리케이션 서버 밖으로 빼서 용량 확장과 내구성, 접근 제어를 전용 서비스에 맡깁니다.",
      "서버는 파일 바이트를 오래 들고 있기보다 파일의 주소와 상태를 DB에 저장하고, 실제 바이트는 객체 스토리지에 둡니다."
    ],
    "웹 개발에서 가장 흔한 전환은 'uploads 폴더에 저장'에서 'object storage에 저장하고 DB에는 key를 저장'으로 넘어가는 것입니다. 이 한 걸음이 배포, 스케일아웃, 백업 설계를 바꿉니다.",
    table("Local disk vs cloud storage", ["구분", "서버 디스크", "클라우드 스토리지"], [["확장", "서버 용량에 묶임", "서비스 단위 확장"], ["장애", "직접 복구", "복제와 내구성 활용"], ["배포", "파일 유실 위험", "앱과 데이터 분리"], ["권한", "앱에서 구현", "정책과 토큰 사용"]]),
    "Provider object storage overview docs",
    ["aws", "azureIntro", "gcsIntro"]),

  slide(3, "intro", "업로드는 파일을 보내는 동작이 아니라 신뢰 경계를 넘기는 동작이다",
    "사용자가 준 파일은 크기, 형식, 악성 여부, 소유자를 확인해야 저장할 수 있습니다.",
    [
      "사진 하나를 올려도 파일명, MIME type, 확장자, 크기 제한, 바이러스 검사, 이미지 변환 같은 검증이 따라옵니다.",
      "클라이언트가 직접 스토리지에 올리게 할 때는 presigned URL이나 SAS처럼 제한된 시간의 권한 위임을 씁니다.",
      "업로드 성공 이후에도 DB 상태, 썸네일 생성, 공개 가능 여부를 별도 상태로 관리해야 합니다."
    ],
    "초보자에게는 '파일을 올린다'지만, 시스템에게는 '신뢰할 수 없는 입력을 받아 저장소와 DB 상태를 일치시키는 트랜잭션 비슷한 흐름'입니다.",
    flow("Upload path", [["Browser", "file 선택"], ["App API", "권한 확인"], ["Storage", "bytes 저장"], ["Worker", "검사와 변환"], ["DB", "상태 확정"]]),
    "AWS S3 User Guide; Azure Blob Storage introduction; Google Cloud Storage overview",
    ["aws", "azureIntro", "gcsIntro"]),

  slide(4, "intro", "다운로드와 공유는 링크 하나처럼 보이지만 권한 계약이다",
    "누가, 언제까지, 어떤 파일을, 어떤 네트워크 경로로 읽을 수 있는지를 명시해야 합니다.",
    [
      "공개 파일은 CDN과 캐시 헤더를 통해 빠르게 전달할 수 있지만, 실수로 민감 데이터가 공개되면 사고가 됩니다.",
      "비공개 파일은 앱 인증을 거친 뒤 짧은 만료 시간을 가진 signed URL로 내려주는 방식이 흔합니다.",
      "공유 링크는 편리하지만 만료, 철회, 다운로드 횟수, 감사 로그가 없으면 운영상 위험해집니다."
    ],
    "스토리지의 읽기 권한을 영구 public으로 열지 않고, 애플리케이션의 권한 판단 결과를 짧은 URL 권한으로 변환하는 것이 안전한 기본 패턴입니다.",
    kv("Access questions", [["Who", "사용자, 서비스 계정, 외부 공유자"], ["What", "객체 key와 version"], ["How long", "만료 시간"], ["From where", "CDN, VPC, public internet"], ["Audit", "누가 읽었는가"]]),
    "Provider security and signed access docs",
    ["aws", "azureSecurity", "gcsIntro"]),

  slide(5, "intro", "클라우드 스토리지에서 폴더는 대부분 진짜 폴더가 아니다",
    "객체 스토리지는 경로처럼 보이는 문자열 key를 prefix로 묶어 폴더처럼 보여줍니다.",
    [
      "photos/2026/cat.jpg는 디렉터리 트리라기보다 slash가 들어간 하나의 객체 이름입니다.",
      "폴더 이동이나 이름 변경은 많은 객체 key를 새 이름으로 복사하고 이전 것을 지우는 작업이 될 수 있습니다.",
      "그래서 대량 rename, list, delete는 파일 시스템보다 비싸고 느릴 수 있으며 별도 배치 작업으로 다뤄야 합니다."
    ],
    "이 차이를 알아야 객체 스토리지에 POSIX 파일 시스템의 rename, append, lock 의미를 기대하지 않습니다. 폴더처럼 보이는 UI와 내부 API 모델을 분리해서 이해해야 합니다.",
    cards("Folder illusion", [["UI", "폴더처럼 표시"], ["API", "bucket + key 문자열"], ["Prefix", "목록 조회 기준"], ["Rename", "복사와 삭제로 구현될 수 있음"]]),
    "AWS S3 User Guide; Google Cloud Storage overview",
    ["aws", "gcsIntro"]),

  slide(6, "intro", "클라우드 스토리지의 네 가지 기본 동사는 upload, store, access, delete다",
    "쉬운 흐름을 먼저 잡으면 뒤의 lifecycle, 권한, 비용 개념이 자연스럽게 붙습니다.",
    [
      "upload는 누가 어떤 파일을 올릴 수 있는지와 실패했을 때 어떻게 재시도할지를 다룹니다.",
      "store는 어디에 어떤 이름으로 얼마나 오래 둘지, 어떤 계층과 복제로 보관할지를 다룹니다.",
      "access와 delete는 읽기 권한, 공유, 감사, 개인정보 삭제, 보존 의무가 충돌하는 지점입니다."
    ],
    "초심자용 네 단어를 버리지 말고 끝까지 가져갑니다. 고급 설계도 결국 upload를 안전하게 받고, store를 싸고 튼튼하게 하고, access를 통제하고, delete를 증명하는 문제입니다.",
    matrix("Four verbs", [["Upload", "입력 검증과 권한 위임"], ["Store", "key, metadata, class"], ["Access", "인증, CDN, signed URL"], ["Delete", "retention, version, privacy"]]),
    "Provider object storage overview docs",
    ["aws", "azureIntro", "gcsIntro"]),

  slide(7, "intro", "컴공 학생이 알아야 할 첫 질문은 '파일이 어디 있나'가 아니다",
    "더 중요한 질문은 주소, 소유권, 실패, 비용, 삭제 기준입니다.",
    [
      "주소는 bucket과 key, URL, CDN path, DB row가 서로 어떻게 대응되는지를 뜻합니다.",
      "소유권은 사용자 계정, 서비스 계정, 조직 계정, 암호화 키, 감사 로그의 책임 경계를 뜻합니다.",
      "실패와 비용은 네트워크 중단, 재시도, 중복 저장, 조회 폭증, 인터넷 송신 비용까지 포함합니다."
    ],
    "단순한 사진 업로드 과제라도 이 질문을 넣으면 전공 수준의 설계 문제가 됩니다. 스토리지는 자료구조, 운영체제, 네트워크, 보안, 분산 시스템이 만나는 지점입니다.",
    kv("CS questions", [["Address", "어떤 key와 URL인가"], ["Ownership", "누가 책임지는가"], ["Failure", "무엇이 깨질 수 있는가"], ["Cost", "무엇에 돈이 드는가"], ["Deletion", "정말 지워졌는가"]]),
    "AWS, Azure, and Google Cloud official storage docs",
    ["aws", "azureIntro", "gcsIntro"]),

  slide(8, "intro", "세 클라우드의 이름은 달라도 큰 구조는 비슷하다",
    "AWS S3, Azure Blob Storage, Google Cloud Storage는 모두 객체를 bucket/container에 넣는 모델입니다.",
    [
      "AWS는 S3 bucket과 object, IAM과 bucket policy를 중심으로 설명합니다.",
      "Azure는 storage account 안의 container와 blob, Entra ID/RBAC/SAS를 중심으로 설명합니다.",
      "Google Cloud는 project 안의 bucket과 object, IAM과 uniform bucket-level access를 중심으로 설명합니다."
    ],
    "초반에는 이름 차이에 겁먹지 않아도 됩니다. 모두 '큰 저장 공간, 객체 이름, 바이트, 메타데이터, 권한 정책'을 가진 서비스이고, 뒤로 갈수록 계정 경계와 통합 방식이 달라집니다.",
    table("Provider vocabulary", ["개념", "AWS", "Azure", "Google"], [["큰 경계", "Account/Bucket", "Storage Account/Container", "Project/Bucket"], ["데이터", "Object", "Blob", "Object"], ["권한", "IAM/Policy", "RBAC/SAS", "IAM/UBLA"], ["이벤트", "SQS/Lambda", "Event Grid", "Pub/Sub"]]),
    "AWS S3 User Guide; Azure Blob Storage introduction; Google Cloud Storage overview",
    ["aws", "azureIntro", "gcsIntro"]),

  slide(9, "intro", "저장소를 고를 때는 파일 종류와 읽기 패턴부터 본다",
    "사진, 동영상, 로그, 백업, 데이터셋은 모두 같은 저장소에 둘 수 있지만 설계 기준은 다릅니다.",
    [
      "프로필 이미지는 작고 자주 읽히므로 CDN, cache header, 이미지 리사이징이 중요합니다.",
      "로그와 분석 데이터는 날짜별 partition, 압축 포맷, catalog, 보관 기간이 중요합니다.",
      "백업은 자주 읽지 않지만 복구 가능성, 불변성, 별도 계정 보관, 복구 훈련이 중요합니다."
    ],
    "클라우드 스토리지는 만능 폴더가 아니라 여러 데이터 제품의 원천 저장소입니다. 같은 bucket 안에서도 object type별로 key, class, lifecycle, 권한을 다르게 가져가야 합니다.",
    cards("Workloads", [["Images", "CDN + derivatives"], ["Video", "large upload + streaming"], ["Logs", "partition + retention"], ["Backup", "immutability + restore"], ["Dataset", "catalog + query"]]),
    "Official provider storage class and lifecycle docs",
    ["awsClasses", "azureTiers", "gcsClasses"]),

  slide(10, "intro", "쉬운 이해에서 어려운 설계로 넘어가는 다리",
    "클라우드 스토리지는 원격 폴더처럼 쓰기 시작하지만, 실제 운영에서는 분산 시스템으로 다뤄야 합니다.",
    [
      "사용자 관점의 질문은 '파일을 올리고 다시 받을 수 있나'입니다.",
      "개발자 관점의 질문은 '권한, key, DB 상태, 이벤트 처리, 캐시, 비용, 삭제가 일관되나'입니다.",
      "전공자 관점의 질문은 '일관성, 내구성, 가용성, 장애 격리, 데이터 수명주기를 어떻게 모델링하나'입니다."
    ],
    "이후 내용은 쉬운 네 동작을 버리지 않고 깊게 들어갑니다. upload는 대용량 세션과 checksum으로, store는 계층과 복제로, access는 IAM과 CDN으로, delete는 versioning과 retention으로 확장됩니다.",
    flow("Learning ladder", [["User", "올리고 받는다"], ["Developer", "API와 DB 상태를 맞춘다"], ["CS", "분산 시스템 속성을 본다"], ["Operator", "비용, 보안, 복구를 운영한다"]]),
    "Provider object storage overview docs",
    ["aws", "azureIntro", "gcsIntro"]),

  slide(11, "implementation", "웹 서비스에서 파일은 DB row와 객체 key가 함께 움직인다",
    "객체 스토리지에는 바이트를 두고, 데이터베이스에는 소유자와 상태와 key를 둡니다.",
    [
      "DB에는 user_id, object_key, content_type, size, status, checksum, created_at 같은 검색 가능한 정보를 저장합니다.",
      "스토리지 객체에는 실제 바이트와 Content-Type, Cache-Control, tag, custom metadata를 저장합니다.",
      "DB commit과 object upload는 완전한 단일 트랜잭션이 아니므로 pending, uploaded, verified, deleted 같은 상태 머신이 필요합니다."
    ],
    "입문자가 자주 놓치는 부분은 '파일을 저장했다'와 '서비스가 그 파일을 사용할 수 있다'가 다르다는 점입니다. DB 상태와 객체 존재 여부가 어긋나는 경우를 복구할 수 있어야 합니다.",
    flow("App storage state", [["DB", "pending row"], ["Storage", "object upload"], ["Worker", "verify/scan"], ["DB", "ready row"], ["Cleanup", "orphan delete"]]),
    "Provider object storage overview docs",
    ["aws", "azureIntro", "gcsIntro"]),

  slide(12, "implementation", "직접 업로드는 서버 부하를 줄이지만 권한 설계가 더 중요해진다",
    "브라우저가 스토리지로 바로 보내면 앱 서버는 바이트 중계 대신 제한된 업로드 권한을 발급합니다.",
    [
      "앱 서버는 사용자를 인증하고 업로드 가능한 key, 크기, 만료 시간, content type 조건을 정합니다.",
      "클라이언트는 받은 presigned URL, SAS, signed policy를 사용해 스토리지에 직접 PUT/POST합니다.",
      "업로드 완료 후 서버는 callback, polling, event, head object로 실제 객체 존재와 metadata를 검증합니다."
    ],
    "직접 업로드는 트래픽 비용과 서버 메모리를 크게 줄이지만, 권한 범위를 잘못 열면 사용자가 임의 key에 파일을 올릴 수 있습니다. 조건이 좁고 만료가 짧아야 합니다.",
    table("Direct upload", ["단계", "역할", "주의점"], [["Sign", "앱 서버", "key/size/type 제한"], ["Upload", "브라우저", "만료 전 전송"], ["Verify", "서버/worker", "size/checksum 검사"], ["Publish", "앱", "ready 상태 전환"]]),
    "Provider signed access and object storage docs",
    ["aws", "azureSecurity", "gcsIntro"]),

  slide(13, "implementation", "업로드 후처리는 이벤트 기반 파이프라인으로 생각한다",
    "저장된 객체는 썸네일, 변환, 검사, 인덱싱, 알림의 입력이 됩니다.",
    [
      "스토리지 이벤트는 새 객체 생성을 Lambda, Functions, Cloud Functions, queue, Pub/Sub 같은 후속 처리로 연결합니다.",
      "이미지 서비스는 원본 저장 뒤 리사이징, EXIF 제거, 유해 이미지 검사, CDN 경로 생성을 수행할 수 있습니다.",
      "이벤트는 중복되거나 순서가 바뀔 수 있으므로 idempotency key와 객체 상태 확인이 필요합니다."
    ],
    "이벤트를 '정확히 한 번 실행되는 함수 호출'처럼 믿으면 위험합니다. 객체 스토리지 후처리는 적어도 한 번 처리, 중복 처리, 실패 재시도, dead-letter queue를 전제로 설계합니다.",
    flow("Object pipeline", [["ObjectCreated", "event"], ["Queue", "buffer/retry"], ["Worker", "scan/transform"], ["DB", "status update"], ["CDN", "serve derivative"]]),
    "AWS S3 Event Notifications; Azure Event Grid; GCS Pub/Sub notifications",
    ["aws", "azureIntro", "gcsPubSub"]),

  slide(14, "implementation", "정적 파일 배포는 스토리지와 CDN의 역할 분담이다",
    "스토리지는 원본을 안정적으로 보관하고 CDN은 사용자 가까이에서 빠르게 전달합니다.",
    [
      "HTML, CSS, JS, 이미지처럼 공개 가능한 파일은 CDN cache hit ratio가 사용자 경험을 좌우합니다.",
      "파일 이름에 hash를 넣으면 오래 캐시해도 새 배포가 안전하고, 같은 key 덮어쓰기로 인한 stale cache를 줄일 수 있습니다.",
      "민감 파일은 CDN에 올리더라도 signed cookie, signed URL, origin access control 같은 보호 경계를 둬야 합니다."
    ],
    "GitHub Pages 같은 정적 사이트도 넓게 보면 object storage와 CDN의 조합입니다. 원본 파일, 캐시 정책, invalidation이 배포 품질을 만듭니다.",
    kv("Static delivery", [["Origin", "객체 스토리지"], ["Edge", "CDN cache"], ["Versioning", "hash filename"], ["Headers", "Cache-Control"], ["Invalidation", "덮어쓰기 처리"]]),
    "Provider object storage and CDN integration docs",
    ["aws", "azureIntro", "gcsIntro"]),

  slide(15, "implementation", "삭제는 remove 버튼이 아니라 수명주기 정책이다",
    "사용자 삭제, 개인정보 삭제, 보존 의무, 백업 복구 가능성이 서로 충돌합니다.",
    [
      "버전 관리가 켜져 있으면 현재 객체 삭제가 실제 바이트 삭제가 아니라 delete marker 추가일 수 있습니다.",
      "법적 보존이나 규정 준수 retention이 있으면 사용자 요청과 별개로 일정 기간 삭제가 제한될 수 있습니다.",
      "반대로 개인정보는 정해진 기간 뒤 확실히 제거해야 하므로 DB row, object version, derivative, backup 범위를 추적해야 합니다."
    ],
    "삭제 설계는 고급 주제가 아니라 초반부터 필요합니다. '언제 지울 것인가'를 모르면 비용은 계속 늘고, '정말 지웠는가'를 모르면 개인정보 리스크가 남습니다.",
    timeline("Deletion path", [["Request", "사용자 삭제"], ["Soft delete", "복구 가능 기간"], ["Lifecycle", "만료 정책"], ["Audit", "삭제 증적"], ["Backup", "복구 범위 확인"]]),
    "Provider lifecycle, versioning, and retention docs",
    ["awsLifecycle", "azureSecurity", "gcsVersioning"]),

  slide(16, "implementation", "이제 객체 스토리지를 분산 시스템으로 읽을 준비가 됐다",
    "쉬운 동작을 실제 시스템 속성으로 번역하면 뒤의 심화 내용이 연결됩니다.",
    [
      "upload는 네트워크 실패와 재시도, multipart, checksum, idempotency 문제로 확장됩니다.",
      "store는 replication, storage class, lifecycle, metadata, versioning 문제로 확장됩니다.",
      "access와 delete는 IAM, signed URL, CDN, audit, retention, object lock 문제로 확장됩니다."
    ],
    "이 지점부터는 용어가 어려워져도 기준은 같습니다. 사용자의 쉬운 흐름을 깨지 않으면서 분산 저장소의 실패와 비용과 보안 조건을 명시적으로 처리하는 것이 목표입니다.",
    matrix("Bridge to deep dive", [["Upload", "multipart, checksum"], ["Store", "durability, class"], ["Access", "IAM, CDN, signed URL"], ["Delete", "version, retention"], ["Operate", "metrics, cost, DR"]]),
    "AWS, Azure, and Google Cloud official storage docs",
    ["aws", "azureIntro", "gcsIntro"])
];

const deepSlidesBase = [
  slide(1, "model", "클라우드 스토리지는 파일 저장소가 아니라 분산 객체 시스템이다",
    "대규모 저장, HTTP API, 권한 정책, 수명주기 자동화가 한 서비스 표면에 묶입니다.",
    [
      "객체 스토리지는 파일 시스템의 폴더/파일 추상화보다 단순하지만 수평 확장과 내구성에 강합니다.",
      "애플리케이션은 파일 바이트를 직접 품기보다 객체 주소, 메타데이터, 접근 정책, 처리 상태를 조합합니다.",
      "컴퓨터공학 관점에서는 네임스페이스, 일관성, 실패 모델, 비용 모델을 함께 보는 분산 시스템입니다."
    ],
    "핵심은 저장 위치가 아니라 API 경계입니다. upload, read, list, delete, lifecycle, policy, event가 모두 시스템 설계의 입력이 됩니다.",
    cards("Object storage surface", [["Data plane", "PUT/GET/LIST/DELETE"], ["Control plane", "bucket, policy, lifecycle"], ["Metadata", "type, tag, checksum"], ["Integration", "event, CDN, analytics"]]),
    "AWS S3 User Guide; Azure Blob Storage introduction; Google Cloud Storage overview",
    ["aws", "azureIntro", "gcsIntro"]),

  slide(2, "model", "블록, 파일, 객체 스토리지는 실패와 접근 단위가 다르다",
    "어떤 데이터를 어떤 단위로 읽고 쓰는지가 저장소 선택의 출발점입니다.",
    [
      "블록 스토리지는 가상 디스크에 가깝고 데이터베이스, 파일 시스템, VM 부트 볼륨에 맞습니다.",
      "파일 스토리지는 POSIX/SMB/NFS처럼 경로, 디렉터리, lock, rename 의미론이 필요한 공유 작업에 맞습니다.",
      "객체 스토리지는 immutable에 가까운 큰 객체를 HTTP API로 다루며 로그, 이미지, 백업, 데이터 레이크에 맞습니다."
    ],
    "객체 스토리지에 파일 시스템처럼 append, rename, directory transaction을 기대하면 설계가 꼬입니다. 객체 API에 맞게 상태와 인덱스를 따로 설계해야 합니다.",
    table("Storage model", ["모델", "접근 단위", "대표 용도"], [["Block", "sector / volume", "DB 디스크, VM"], ["File", "path / inode", "공유 폴더, NAS"], ["Object", "bucket + key", "미디어, 로그, 백업"], ["Database", "row / query", "트랜잭션 상태"]]),
    "Provider storage overview docs",
    ["aws", "azureAccount", "gcsIntro"]),

  slide(3, "model", "객체는 바이트, 이름, 메타데이터, 정책의 묶음이다",
    "bucket + key + bytes만 보면 부족하고, 객체 주변의 제어 정보를 함께 봐야 합니다.",
    [
      "key는 객체의 주소이면서 lifecycle, 비용 배분, 권한 조건, 배치 처리의 주요 인덱스가 됩니다.",
      "metadata와 tag는 Content-Type, Cache-Control, owner, retention class, processing state 같은 자동화 정보를 담습니다.",
      "versioning이 켜지면 같은 key 아래 여러 세대가 존재하므로 delete marker와 noncurrent version 비용을 이해해야 합니다."
    ],
    "객체 스토리지는 데이터 자체보다 데이터 주변의 설명과 정책이 운영 품질을 결정합니다. 업로드 시점에 붙인 정보가 수백만 개 객체의 자동화를 좌우합니다.",
    kv("Object anatomy", [["Bucket", "권한과 정책의 큰 경계"], ["Key", "객체 주소와 prefix 인덱스"], ["Bytes", "실제 데이터"], ["Metadata", "브라우저, 캐시, 처리 상태"], ["Policy", "누가 무엇을 할 수 있는가"]]),
    "AWS S3 User Guide; Google Cloud Storage overview",
    ["aws", "gcsIntro"]),

  slide(4, "model", "일관성, 내구성, 가용성은 서로 다른 약속이다",
    "저장소가 튼튼하다는 말은 어떤 실패를 어느 수준으로 견디는지로 쪼개야 합니다.",
    [
      "일관성은 쓰기 직후 읽기와 목록 조회가 어떤 결과를 보장하는지에 관한 약속입니다.",
      "내구성은 저장된 객체가 디스크, 노드, 가용 영역 장애 이후에도 사라지지 않을 확률입니다.",
      "가용성은 특정 시점에 요청을 성공적으로 처리할 수 있는지이며 리전, 영역, 네트워크 장애와 연결됩니다."
    ],
    "복제본이 많다고 모든 문제가 해결되지는 않습니다. stale list, cross-region lag, KMS 권한 장애, DNS/CDN 장애는 서로 다른 계층의 실패입니다.",
    matrix("Reliability vocabulary", [["Consistency", "쓰기 직후 무엇을 볼 수 있는가"], ["Durability", "저장된 데이터가 사라지지 않는가"], ["Availability", "요청을 지금 처리할 수 있는가"], ["Recovery", "깨졌을 때 다시 만들 수 있는가"]]),
    "AWS S3 User Guide; Azure redundancy docs; Google Cloud Storage overview",
    ["aws", "azureRedundancy", "gcsIntro"]),

  slide(5, "model", "데이터 플레인과 컨트롤 플레인을 분리해서 본다",
    "파일을 주고받는 요청과 정책을 바꾸는 요청은 성격도 위험도 다릅니다.",
    [
      "데이터 플레인은 object PUT/GET, multipart part upload, range read처럼 트래픽과 지연시간에 직접 영향을 줍니다.",
      "컨트롤 플레인은 bucket 생성, IAM, lifecycle, replication, retention, logging처럼 운영 상태를 바꿉니다.",
      "장애 분석에서는 데이터 요청이 실패했는지, 권한/정책 변경이 실패했는지, 이벤트 후처리가 지연되는지 분리해야 합니다."
    ],
    "프로덕션 권한도 이 분리를 따라갑니다. 애플리케이션은 객체 read/write만 갖고, 정책 변경 권한은 IaC와 리뷰 파이프라인에 묶는 편이 안전합니다.",
    flow("Request planes", [["Client", "PUT/GET"], ["Storage API", "data path"], ["Admin/IaC", "policy changes"], ["Audit log", "who changed what"]]),
    "Provider object storage API docs",
    ["aws", "azureIntro", "gcsIntro"]),

  slide(6, "model", "객체 key 설계는 검색이 아니라 운영을 위한 인덱스 설계다",
    "좋은 key는 보기 좋은 이름보다 정책, 목록 조회, 배치 작업, 비용 분석에 유리한 이름입니다.",
    [
      "tenant, date, object type, privacy class, hash를 어떤 순서로 둘지에 따라 lifecycle과 inventory 분석 비용이 달라집니다.",
      "개인정보나 원본 파일명을 key에 직접 넣으면 URL, 로그, 알림, 분석 도구를 통해 노출될 수 있습니다.",
      "prefix 기준 정책을 쓴다면 권한 경계와 삭제 경계가 같은 prefix에 섞이지 않게 설계해야 합니다."
    ],
    "예시는 tenant/{tenantId}/dt=2026-06-14/type=image/{uuid}.webp처럼 운영 조건을 앞에 두고, 사용자가 준 이름은 metadata나 DB에 두는 방식입니다.",
    kv("Key design", [["권장", "tenant/date/type/uuid"], ["주의", "email/name/idcard in key"], ["정책", "prefix + tag 조건"], ["조회", "inventory와 catalog 사용"]]),
    "AWS S3 User Guide; Google Cloud Storage overview",
    ["aws", "gcsIntro"]),

  slide(7, "model", "대용량 업로드는 단일 요청이 아니라 세션과 청크의 문제다",
    "네트워크 실패를 전제로 upload session, part, checksum, resume을 설계해야 합니다.",
    [
      "S3 multipart upload는 객체를 part 단위로 올리고 실패한 part만 재전송할 수 있게 합니다.",
      "Azure block blob은 block을 stage한 뒤 block list를 commit하는 구조로 큰 객체를 조립합니다.",
      "Google Cloud Storage는 resumable upload로 세션 URI를 만들고 중단된 offset부터 이어 올릴 수 있습니다."
    ],
    "업로드가 끝나지 않은 세션과 part는 비용과 정합성 문제를 만들 수 있으므로 abort/expire 규칙과 DB 상태 머신이 필요합니다.",
    table("Large upload primitives", ["Provider", "Primitive", "운영 포인트"], [["AWS", "Multipart upload", "part retry, abort incomplete"], ["Azure", "Put Block/List", "block id, commit list"], ["Google", "Resumable upload", "session URI, offset"], ["공통", "Checksum", "corruption detection"]]),
    "AWS S3 multipart docs; Azure Blob docs; Google Cloud Storage upload docs",
    ["awsMultipart", "azureIntro", "gcsIntro"]),

  slide(8, "model", "HTTP 캐시와 CDN은 객체 스토리지의 읽기 모델을 바꾼다",
    "객체 하나를 빠르게 읽는 문제보다 캐시 가능한 URL을 설계하는 문제가 더 큽니다.",
    [
      "Cache-Control, ETag, Last-Modified, immutable filename은 브라우저와 CDN이 재검증을 얼마나 할지 결정합니다.",
      "같은 key를 덮어쓰면 CDN purge와 stale object 문제가 생기므로 fingerprinted key가 안전합니다.",
      "Range request, compression, image derivative는 bandwidth와 latency를 동시에 줄이는 설계 도구입니다."
    ],
    "정적 미디어 시스템에서 객체 스토리지는 origin이고, 사용자 경험은 CDN cache hit ratio와 invalidation 전략에 의해 좌우됩니다.",
    flow("Static delivery", [["Object", "origin bytes"], ["Metadata", "cache headers"], ["CDN", "edge cache"], ["Browser", "revalidate or reuse"]]),
    "Provider object storage and CDN integration docs",
    ["aws", "azureIntro", "gcsIntro"]),

  slide(9, "aws", "S3 bucket은 계정 안의 보안 경계이자 네임스페이스다",
    "S3 설계는 bucket ownership, public access block, object ownership을 먼저 정하고 시작합니다.",
    [
      "bucket 이름은 전역적으로 유일하며 URL과 로그에 드러나므로 조직의 naming convention이 필요합니다.",
      "Block Public Access는 실수로 public policy나 ACL을 열어도 계정/버킷 단위에서 차단하는 안전장치입니다.",
      "Object Ownership과 ACL 비활성화 방향은 객체 소유권과 권한 관리를 policy 중심으로 단순화합니다."
    ],
    "S3를 단순 저장소로 열기 전에 계정 레벨 guardrail, IaC, CloudTrail, bucket policy linting을 먼저 깔아야 공개 사고를 줄일 수 있습니다.",
    matrix("S3 bucket baseline", [["Name", "global namespace"], ["Ownership", "object writer vs bucket owner"], ["Public access", "account/bucket blocking"], ["Audit", "CloudTrail and access logs"]]),
    "AWS S3 User Guide; S3 security best practices",
    ["aws"]),

  slide(10, "aws", "S3 권한은 IAM, bucket policy, access point가 합쳐진 결과다",
    "허용 하나만 보는 것이 아니라 identity, resource, condition, network 경계를 모두 합성해야 합니다.",
    [
      "IAM policy는 주체가 무엇을 할 수 있는지, bucket policy는 리소스가 누구를 허용하는지 정의합니다.",
      "Condition에는 prefix, object tag, source VPC endpoint, TLS, encryption header 같은 제약을 걸 수 있습니다.",
      "Access Point와 VPC endpoint는 대규모 조직에서 워크로드별 접근 경계를 분리하는 데 유용합니다."
    ],
    "권한 디버깅은 allow를 찾는 일이 아니라 explicit deny, SCP, boundary, bucket policy, KMS key policy를 차례로 좁히는 과정입니다.",
    flow("S3 auth evaluation", [["Principal", "role/session"], ["Policy", "IAM + bucket"], ["Condition", "prefix/tag/VPC"], ["KMS", "key policy"]]),
    "AWS S3 User Guide; S3 security best practices",
    ["aws"]),

  slide(11, "aws", "S3 storage class는 성능, 접근 빈도, 최소 보관 기간의 선택이다",
    "Standard, IA, One Zone, Glacier 계열, Intelligent-Tiering은 같은 내구성만 보고 고르면 안 됩니다.",
    [
      "Standard는 자주 읽고 낮은 지연시간이 필요한 일반 객체에 맞습니다.",
      "Infrequent Access와 Glacier 계열은 저장비를 낮추는 대신 retrieval, minimum duration, restore latency를 고려해야 합니다.",
      "Intelligent-Tiering은 접근 패턴이 변하거나 예측하기 어려운 객체에서 자동 계층화를 맡기는 선택지입니다."
    ],
    "가격표 숫자를 외우는 대신 access frequency, restore objective, object size, retention duration, request volume을 모델링해야 합니다.",
    table("S3 class trade-off", ["Class", "적합한 패턴", "주의점"], [["Standard", "자주 읽음", "저장비 높음"], ["IA", "가끔 읽음", "retrieval 비용"], ["Glacier", "장기 보관", "restore 지연"], ["Intelligent", "예측 어려움", "monitoring/automation"]]),
    "Understanding and managing Amazon S3 storage classes",
    ["awsClasses"]),

  slide(12, "aws", "S3 Lifecycle은 삭제 자동화가 아니라 상태 전이 자동화다",
    "current, noncurrent, expired delete marker, incomplete multipart upload를 각각 다르게 다룹니다.",
    [
      "Lifecycle rule은 prefix, tag, object age, version state를 조건으로 transition과 expiration을 수행합니다.",
      "Versioning이 켜진 bucket에서는 current object와 noncurrent version의 보관 정책을 분리해야 합니다.",
      "Incomplete multipart upload 정리는 대용량 업로드 실패가 장기 비용으로 쌓이지 않게 하는 필수 규칙입니다."
    ],
    "Lifecycle을 전역 적용하기 전에 작은 prefix와 tag로 dry run에 가까운 실험을 하고, Inventory와 Storage Lens로 결과를 확인해야 합니다.",
    timeline("Lifecycle states", [["Day 0", "Standard write"], ["Day 30", "IA transition"], ["Day 180", "Archive transition"], ["Day 365", "expire noncurrent"]]),
    "S3 Lifecycle documentation; S3 Storage Lens optimization docs",
    ["awsLifecycle", "awsStorageLens"]),

  slide(13, "aws", "S3 multipart upload와 checksum은 데이터 무결성 설계의 일부다",
    "ETag를 MD5처럼 단순 해석하면 multipart, encryption, checksum mode에서 틀릴 수 있습니다.",
    [
      "multipart upload는 part를 독립적으로 업로드하고 Complete 단계에서 객체로 조립합니다.",
      "part size, parallelism, retry budget은 throughput과 memory, timeout, 비용의 균형점입니다.",
      "최신 SDK의 checksum 지원을 사용하면 전송 중 손상과 저장 후 검증을 더 명시적으로 다룰 수 있습니다."
    ],
    "대용량 업로드 경로는 client retry, presigned part URL, abort rule, checksum validation, DB state transition을 한 흐름으로 설계해야 합니다.",
    flow("Multipart path", [["Create", "upload id"], ["Upload parts", "parallel retry"], ["Complete", "assemble"], ["Abort", "cleanup failure"]]),
    "Uploading and copying objects using multipart upload in Amazon S3",
    ["awsMultipart"]),

  slide(14, "aws", "S3 Event Notifications는 후처리 파이프라인의 시작점이다",
    "객체 생성 이벤트는 Lambda, SQS, SNS, EventBridge로 이어져 scan, resize, indexing을 트리거합니다.",
    [
      "이벤트 기반 후처리는 업로드 API 응답을 빠르게 유지하면서 무거운 작업을 비동기로 분리합니다.",
      "이벤트 중복, 순서, 재시도 실패를 고려해 idempotent handler와 dead-letter queue가 필요합니다.",
      "객체 key와 metadata가 후처리 라우팅 조건이 되므로 업로드 시점의 naming과 tag가 중요합니다."
    ],
    "실무에서는 업로드 완료와 서비스 공개를 같은 상태로 보지 않습니다. scan 완료, 변환 완료, DB publish 상태를 분리해야 합니다.",
    flow("S3 event pipeline", [["PUT object", "raw upload"], ["Event", "SQS/EventBridge"], ["Worker", "scan/resize"], ["DB", "publish state"]]),
    "AWS S3 User Guide",
    ["aws"]),

  slide(15, "aws", "S3 Replication은 DR뿐 아니라 데이터 거버넌스 기능이다",
    "SRR, CRR, replication time control, delete marker replication, KMS replication 조건을 따로 봐야 합니다.",
    [
      "동일 리전 복제는 계정 분리와 실수 복구, 다른 리전 복제는 리전 장애와 지리적 요구에 대응합니다.",
      "복제는 비동기이므로 RPO를 0으로 만들지 못하며, replication lag와 failed operations를 모니터링해야 합니다.",
      "KMS로 암호화한 객체는 원본과 대상의 key policy, IAM, region 조건이 모두 맞아야 복제됩니다."
    ],
    "복제를 켠다고 백업이 완성되지는 않습니다. 삭제와 암호화 실수까지 복제할지, 독립 복구 계정을 둘지 별도 결정이 필요합니다.",
    matrix("Replication decisions", [["Scope", "prefix/tag filter"], ["Target", "same or cross region"], ["Delete", "delete marker policy"], ["Encryption", "KMS key mapping"]]),
    "Amazon S3 Replication documentation",
    ["aws"]),

  slide(16, "aws", "Object Lock은 삭제 방지가 아니라 규정 준수 상태 머신이다",
    "retention mode, legal hold, governance bypass, replication 조건을 이해해야 안전하게 쓸 수 있습니다.",
    [
      "Governance mode는 특정 권한이 있으면 우회할 수 있고, Compliance mode는 retention 기간 동안 더 강한 불변성을 제공합니다.",
      "Legal hold는 기간이 아니라 사건 기반 보존이며 retention period와 함께 적용될 수 있습니다.",
      "Object Lock은 bucket 생성 시점 설정과 versioning 조건이 얽히므로 나중에 켜는 계획을 가볍게 보면 안 됩니다."
    ],
    "랜섬웨어 대응 백업 bucket은 application write role과 admin delete role을 분리하고, Object Lock 및 cross-account 복구 경로를 함께 설계합니다.",
    table("Object Lock terms", ["개념", "의미", "주의점"], [["Retention", "기간 기반 보존", "mode 차이"], ["Legal hold", "사건 기반 보존", "수동 해제"], ["Versioning", "불변 객체 단위", "비용 증가"], ["Replication", "보존정보 복제", "대상 bucket 조건"]]),
    "Amazon S3 Object Lock documentation",
    ["awsObjectLock"]),

  slide(17, "aws", "S3 Storage Lens, Inventory, Batch Operations는 운영 규모의 도구다",
    "객체가 수백만 개를 넘으면 콘솔 목록 조회가 아니라 재고 데이터와 배치 작업으로 운영합니다.",
    [
      "Storage Lens는 계정과 조직 수준의 사용량, activity, protection, cost optimization 지표를 제공합니다.",
      "Inventory는 객체 목록과 metadata를 주기적으로 생성해 Athena, Glue, batch job의 입력으로 쓰기 좋습니다.",
      "Batch Operations는 대량 tag 변경, copy, restore, Lambda invoke 같은 객체 단위 작업을 관리형으로 수행합니다."
    ],
    "운영자는 bucket 하나를 보는 사람이 아니라 fleet을 보는 사람입니다. 모든 객체를 즉석 LIST로 찾는 설계는 규모가 커지면 비용과 시간이 폭발합니다.",
    cards("S3 at scale", [["Storage Lens", "usage and activity visibility"], ["Inventory", "object catalog export"], ["Batch Ops", "bulk object actions"], ["Athena", "query inventory"]]),
    "Amazon S3 Storage Lens documentation",
    ["awsStorageLens"]),

  slide(18, "aws", "S3를 데이터 레이크로 쓸 때는 파일 포맷과 catalog가 핵심이다",
    "객체 스토리지는 cheap durable bytes이고, 분석 테이블은 Parquet, partition, table metadata가 만듭니다.",
    [
      "Parquet/ORC 같은 columnar format은 scan byte를 줄이고 predicate pushdown을 가능하게 합니다.",
      "Glue Catalog, Athena, EMR, Spark, Iceberg/Hudi/Delta 계열 테이블 포맷이 객체 묶음을 테이블처럼 해석합니다.",
      "작은 파일이 너무 많으면 request와 planning overhead가 커지므로 compaction과 partition 설계가 필요합니다."
    ],
    "데이터 레이크의 성능 문제는 S3 자체보다 file layout, partition cardinality, metadata catalog, query engine 설정에서 자주 생깁니다.",
    flow("Lake on S3", [["Raw objects", "bronze"], ["Columnar", "Parquet"], ["Catalog", "schema/table"], ["Query", "Athena/Spark"]]),
    "AWS S3 User Guide; AWS analytics docs",
    ["aws"]),

  slide(19, "azure", "Azure Storage Account는 Blob만이 아니라 계정 단위 플랫폼이다",
    "Blob, Files, Queue, Table을 담는 account가 namespace, redundancy, networking, encryption의 기준입니다.",
    [
      "Storage account는 Azure 안의 고유 namespace이며 HTTP/HTTPS endpoint를 제공합니다.",
      "계정 종류와 성능 계층은 지원 기능, 비용, redundancy 옵션, 프로토콜 선택에 영향을 줍니다.",
      "Blob 데이터는 account, container, blob 계층으로 관리되고 container는 접근 정책의 기본 경계가 됩니다."
    ],
    "Azure 설계에서는 bucket부터 생각하기보다 account boundary를 먼저 생각합니다. account가 네트워크, 암호화, 복제, RBAC의 묶음이기 때문입니다.",
    kv("Azure hierarchy", [["Storage account", "namespace and settings"], ["Container", "blob grouping"], ["Blob", "object data"], ["Endpoint", "public/private access"]]),
    "Azure storage account overview; Azure Blob Storage introduction",
    ["azureAccount", "azureIntro"]),

  slide(20, "azure", "Block, Append, Page Blob은 같은 Blob Storage 안의 다른 쓰기 모델이다",
    "Blob type은 객체의 update pattern과 API 제한을 결정합니다.",
    [
      "Block blob은 일반 파일, 이미지, 문서, 대용량 업로드에 가장 흔한 형태이며 block commit으로 조립됩니다.",
      "Append blob은 로그처럼 뒤에 이어 붙이는 패턴에 맞지만 임의 위치 수정에는 맞지 않습니다.",
      "Page blob은 random read/write page 단위가 필요했던 VHD와 특수 워크로드에 쓰입니다."
    ],
    "객체 스토리지를 모두 immutable로만 보면 Azure의 blob type 차이를 놓칩니다. 쓰기 패턴에 맞는 타입을 고르는 것이 API 오류와 비용을 줄입니다.",
    table("Blob types", ["Type", "쓰기 모델", "대표 용도"], [["Block", "stage + commit", "파일, 미디어"], ["Append", "append-only", "로그"], ["Page", "random page IO", "VHD"], ["ADLS path", "HNS path ops", "분석 레이크"]]),
    "Azure Blob Storage introduction",
    ["azureIntro"]),

  slide(21, "azure", "Azure access tier는 Hot, Cool, Cold, Archive의 경제 모델이다",
    "tier 선택은 저장비와 접근 비용, 최소 보관 기간, rehydration 지연의 조합입니다.",
    [
      "Hot은 자주 접근하는 데이터에, Cool/Cold는 낮은 접근 빈도 데이터에, Archive는 오프라인 장기 보관에 맞습니다.",
      "Archive tier 객체는 읽기 전에 online tier로 rehydrate해야 하므로 복구 시간 목표와 충돌할 수 있습니다.",
      "Lifecycle management policy로 age와 prefix 조건에 따라 tier 이동과 삭제를 자동화할 수 있습니다."
    ],
    "Azure의 Cold tier는 Archive와 다르게 online tier입니다. 수업 자료에서는 Hot/Cool/Cold/Archive를 모두 같은 '차가움'으로 뭉개지 말고 online/offline 차이를 분명히 둡니다.",
    timeline("Blob access tiers", [["Hot", "frequent access"], ["Cool", "infrequent online"], ["Cold", "rare online"], ["Archive", "offline rehydrate"]]),
    "Azure Blob access tiers documentation",
    ["azureTiers"]),

  slide(22, "azure", "Azure redundancy는 LRS, ZRS, GRS, GZRS, RA 옵션의 조합이다",
    "복제 위치와 읽기 가능성이 데이터 내구성, 가용성, 재해복구 전략을 결정합니다.",
    [
      "LRS는 단일 region 안에서 로컬 복제, ZRS는 여러 availability zone에 동기 복제합니다.",
      "GRS/GZRS는 paired region으로 비동기 복제해 regional disaster에 대비합니다.",
      "RA-GRS/RA-GZRS는 secondary endpoint 읽기를 제공하지만 데이터는 비동기 복제 지연을 가질 수 있습니다."
    ],
    "Azure redundancy는 account 수준 선택입니다. 한 container만 다른 redundancy로 바꾸는 모델이 아니므로 workload 경계와 account 분리를 함께 설계해야 합니다.",
    table("Azure redundancy", ["옵션", "범위", "읽기"], [["LRS", "single region", "primary"], ["ZRS", "zones", "primary"], ["GRS", "paired region", "failover"], ["RA-GRS", "paired region", "secondary read"]]),
    "Azure Storage redundancy documentation",
    ["azureRedundancy"]),

  slide(23, "azure", "Azure 권한은 Entra ID, RBAC, SAS, account key가 공존한다",
    "운영 환경에서는 공유 키보다 identity 기반 접근과 짧은 수명의 SAS를 선호합니다.",
    [
      "Azure RBAC는 Entra ID principal에 Storage Blob Data Reader/Contributor 같은 data plane 역할을 부여합니다.",
      "User delegation SAS는 Entra ID로 승인된 단기 위임 토큰이라 account key 기반 SAS보다 통제하기 좋습니다.",
      "Account key는 강력하지만 회전과 유출 대응 부담이 크므로 애플리케이션에 직접 배포하지 않는 것이 안전합니다."
    ],
    "SAS는 URL 자체가 권한입니다. 만료 시간, IP 제한, protocol 제한, permission scope를 좁히고 로그에서 URL 전체가 노출되지 않게 다뤄야 합니다.",
    flow("Azure auth choices", [["Entra ID", "RBAC roles"], ["SAS", "delegated URL"], ["Account key", "broad secret"], ["Policy", "scope and expiry"]]),
    "Azure Blob security recommendations",
    ["azureSecurity"]),

  slide(24, "azure", "Private Endpoint와 firewall은 Blob 접근 경로를 네트워크로 제한한다",
    "public endpoint를 쓰는지, private link로 VNet 내부화하는지가 보안 모델을 크게 바꿉니다.",
    [
      "Storage account firewall은 허용 네트워크와 trusted services를 제한할 수 있습니다.",
      "Private Endpoint는 Blob endpoint를 VNet private IP로 노출해 공용 인터넷 경로를 줄입니다.",
      "DNS split-horizon과 private DNS zone 구성이 잘못되면 애플리케이션이 public endpoint로 우회할 수 있습니다."
    ],
    "네트워크 경계는 IAM을 대체하지 않습니다. identity, network, encryption, logging을 겹쳐서 defense-in-depth로 봅니다.",
    matrix("Network controls", [["Firewall", "allowed networks"], ["Private Endpoint", "private IP"], ["DNS", "private zone"], ["RBAC", "identity layer"]]),
    "Azure Blob security recommendations; Azure architecture best practices",
    ["azureSecurity", "azureArchitecture"]),

  slide(25, "azure", "Blob soft delete, versioning, immutability는 삭제 사고의 복구 계층이다",
    "삭제 방지 기능은 비용과 운영 절차를 늘리지만 실수와 랜섬웨어에 대한 시간을 벌어줍니다.",
    [
      "Soft delete는 삭제된 blob이나 container를 보존 기간 안에 복원할 수 있게 합니다.",
      "Blob versioning은 overwrite와 delete 이전 상태를 version으로 남겨 복구 지점을 제공합니다.",
      "Immutable storage policy와 legal hold는 규정 준수 보존과 변경 방지를 제공합니다."
    ],
    "복구 기능을 켜는 것만으로 충분하지 않습니다. 보존 기간, unlock 권한, lifecycle 정리, 복원 리허설을 함께 정해야 합니다.",
    table("Azure data protection", ["기능", "보호 대상", "운영 고려"], [["Soft delete", "deleted blobs", "retention window"], ["Versioning", "overwrites", "version cost"], ["Immutable policy", "regulated data", "lock state"], ["Legal hold", "case hold", "manual lifecycle"]]),
    "Azure Blob security and data protection docs",
    ["azureSecurity"]),

  slide(26, "azure", "Object replication은 계정 간 비동기 복제 정책이다",
    "Azure Blob object replication은 block blob 변경을 source에서 destination으로 복사합니다.",
    [
      "복제 정책은 source/destination account, container, rule, prefix match를 기준으로 구성됩니다.",
      "온라인 tier의 block blob 복제가 중심이며 archive tier와 rehydration 시나리오는 제한을 확인해야 합니다.",
      "복제 지연, 실패, delete propagation 정책은 RPO와 운영 절차에 직접 영향을 줍니다."
    ],
    "복제 대상은 같은 권한 실수를 공유하지 않게 별도 account, 별도 subscription, 별도 role assignment로 격리하는 방식을 검토합니다.",
    flow("Azure replication", [["Source account", "block blobs"], ["Rule", "container/prefix"], ["Async copy", "lag"], ["Destination", "DR or analytics"]]),
    "Azure object replication for block blobs",
    ["azureReplication"]),

  slide(27, "azure", "Event Grid와 Functions는 Blob 변경을 애플리케이션 이벤트로 바꾼다",
    "BlobCreated, BlobDeleted 같은 이벤트는 검사, 변환, 인덱싱, 알림 파이프라인의 입력이 됩니다.",
    [
      "Event Grid는 storage event를 구독자에게 라우팅하고 retry와 dead-letter 구성을 제공합니다.",
      "Function은 작은 후처리에 적합하지만 대규모 이미지/영상 처리에는 queue와 worker pool을 따로 설계해야 합니다.",
      "이벤트 소비자는 중복 처리, 순서 불일치, 객체가 이미 삭제된 race condition을 견뎌야 합니다."
    ],
    "Blob 이벤트는 데이터베이스 트랜잭션과 원자적으로 묶이지 않습니다. 상태 저장소에 idempotency key와 processing status를 남겨야 합니다.",
    flow("Azure event path", [["Upload", "BlobCreated"], ["Event Grid", "route"], ["Function", "process"], ["DB/Search", "index"]]),
    "Azure Blob Storage introduction; Azure architecture best practices",
    ["azureIntro", "azureArchitecture"]),

  slide(28, "azure", "Data Lake Storage Gen2는 Blob Storage에 계층형 namespace를 더한다",
    "분석 워크로드는 객체뿐 아니라 디렉터리 의미론, ACL, atomic rename이 중요할 수 있습니다.",
    [
      "Hierarchical namespace는 directory와 file path 작업을 효율화하고 Hadoop 호환 분석 도구와 맞춥니다.",
      "ADLS Gen2는 Blob Storage 기반이지만 ACL과 path operation이 데이터 레이크 운영에 더 잘 맞습니다.",
      "분석 테이블에서는 partition layout, file size, access tier, lifecycle이 query cost에 영향을 줍니다."
    ],
    "Azure에서 단순 Blob과 ADLS Gen2 선택은 저장소 이름 문제가 아니라 분석 엔진과 권한 모델, rename semantics 요구의 문제입니다.",
    matrix("ADLS Gen2", [["HNS", "directory operations"], ["ACL", "fine-grained access"], ["Analytics", "Spark/Synapse"], ["Lifecycle", "tier and retention"]]),
    "Azure Storage account overview; Azure Blob architecture guidance",
    ["azureAccount", "azureArchitecture"]),

  slide(29, "gcp", "Google Cloud Storage는 bucket, object, location, storage class로 시작한다",
    "Cloud Storage bucket은 location과 default storage class가 결합된 객체 컨테이너입니다.",
    [
      "Bucket location은 region, dual-region, multi-region 선택으로 latency, availability, data residency를 결정합니다.",
      "Object는 immutable generation을 가지며 metadata와 storage class를 함께 가집니다.",
      "기본 storage class와 lifecycle rule은 새 객체와 기존 객체의 비용 모델에 영향을 줍니다."
    ],
    "GCS는 bucket 생성 시 location과 protection 설정이 뒤의 운영 제약을 만듭니다. data residency와 analytics region을 미리 맞추는 것이 중요합니다.",
    kv("GCS primitives", [["Bucket", "location and policy"], ["Object", "data + metadata"], ["Generation", "object version identity"], ["Class", "cost/access profile"]]),
    "Cloud Storage overview",
    ["gcsIntro"]),

  slide(30, "gcp", "Uniform bucket-level access는 GCS 권한 모델을 IAM 중심으로 단순화한다",
    "객체 ACL과 bucket IAM을 섞으면 권한 추론이 어려워지므로 조직 정책이 중요합니다.",
    [
      "Uniform bucket-level access를 사용하면 객체 ACL 대신 bucket IAM으로 접근을 관리합니다.",
      "Public Access Prevention은 public grant가 생기는 것을 막아 실수 노출을 줄입니다.",
      "Service account, workload identity, signed URL 권한을 목적별로 분리해야 운영 추적이 쉬워집니다."
    ],
    "GCS 권한도 identity, resource, condition, organization policy가 합쳐진 결과입니다. 공개 객체가 필요한 경우에도 public bucket보다 CDN signed URL을 검토합니다.",
    flow("GCS access model", [["IAM", "bucket-level roles"], ["UBLA", "disable object ACL"], ["PAP", "block public"], ["Signed URL", "temporary access"]]),
    "Cloud Storage overview; Google Cloud Storage security docs",
    ["gcsIntro"]),

  slide(31, "gcp", "GCS signed URL과 signed policy는 제한된 시간의 객체 접근 계약이다",
    "서버는 직접 파일을 프록시하지 않고 서명된 조건을 발급해 client와 storage를 연결합니다.",
    [
      "Signed URL은 특정 method, object, expiration에 대해 임시 접근을 제공합니다.",
      "Upload policy는 content type, size, prefix 같은 조건을 강제해 client-side direct upload를 제한할 수 있습니다.",
      "서명 주체의 key 관리와 expiration 설계가 유출 시 피해 범위를 결정합니다."
    ],
    "직접 업로드 설계에서는 signed URL이 곧 권한입니다. DB에는 issued, uploaded, scanned, published 같은 상태를 별도 저장해야 합니다.",
    flow("Signed access", [["API", "authorize user"], ["Signer", "URL + expiry"], ["Client", "PUT/GET"], ["Storage", "enforce signature"]]),
    "Cloud Storage overview",
    ["gcsIntro"]),

  slide(32, "gcp", "GCS storage class와 Autoclass는 접근 패턴을 비용 정책으로 바꾼다",
    "Standard, Nearline, Coldline, Archive는 읽기 빈도와 retrieval 조건에 따라 선택합니다.",
    [
      "Standard는 자주 접근하거나 낮은 지연시간이 필요한 데이터에 맞습니다.",
      "Nearline/Coldline/Archive는 낮은 저장비와 낮은 접근 빈도를 전제로 하며 retrieval과 최소 보관 기간을 봐야 합니다.",
      "Autoclass는 객체 접근 패턴에 따라 storage class 전환을 자동화해 운영 부담을 줄입니다."
    ],
    "Autoclass는 모든 비용 고민을 없애는 기능이 아니라 접근 패턴 판단을 서비스에 맡기는 선택입니다. 예외 workload와 reporting은 계속 봐야 합니다.",
    table("GCS class model", ["Class", "접근 패턴", "운영 관점"], [["Standard", "frequent", "low latency"], ["Nearline", "monthly", "retrieval cost"], ["Coldline", "quarterly", "backup/archive"], ["Archive", "rare", "long-term retention"], ["Autoclass", "unknown", "automatic transitions"]]),
    "Google Cloud Storage classes; Autoclass",
    ["gcsClasses", "gcsAutoclass"]),

  slide(33, "gcp", "GCS Lifecycle rule은 age, version, class, prefix 조건으로 객체를 전이한다",
    "수명주기 정책은 TTL, cold transition, noncurrent version cleanup을 코드화합니다.",
    [
      "Lifecycle configuration은 bucket 단위 rule로 구성되며 조건을 만족하는 현재와 미래 객체에 적용됩니다.",
      "조건에는 age, createdBefore, matchesPrefix/Suffix, storageClass, numNewerVersions 등이 포함될 수 있습니다.",
      "로그와 usage data를 보고 작은 범위부터 적용해야 예상치 못한 데이터 삭제를 막을 수 있습니다."
    ],
    "GCS lifecycle은 비용 절감 도구이면서 데이터 보존 정책 구현 도구입니다. 삭제 policy는 개인정보, 감사, 복구 요구와 같이 검토해야 합니다.",
    timeline("GCS lifecycle", [["Upload", "Standard"], ["30 days", "Nearline"], ["180 days", "Archive"], ["Policy end", "delete or retain"]]),
    "Google Cloud Object Lifecycle Management",
    ["gcsLifecycle"]),

  slide(34, "gcp", "Object Versioning, retention policy, hold는 GCS의 데이터 보호 계층이다",
    "삭제와 overwrite를 복구 가능한 사건으로 만들지만 version cost와 해제 절차를 관리해야 합니다.",
    [
      "Object Versioning은 삭제된 객체를 noncurrent generation으로 보존해 특정 세대를 복구할 수 있게 합니다.",
      "Retention policy와 bucket lock은 일정 기간 객체 삭제와 수정을 막는 강한 보존 모델을 제공합니다.",
      "Event-based hold와 temporary hold는 사건이나 워크플로우 완료 전까지 객체 변경을 제한하는 데 쓰입니다."
    ],
    "GCS에서 generation과 metageneration은 조건부 업데이트의 핵심입니다. ifGenerationMatch를 사용하면 overwrite race를 줄일 수 있습니다.",
    table("GCS protection", ["기능", "대상", "설계 포인트"], [["Versioning", "generations", "cleanup rule"], ["Retention", "time policy", "bucket lock"], ["Holds", "workflow/case", "release process"], ["Precondition", "generation match", "race prevention"]]),
    "Object Versioning; Retention policies and Bucket Lock",
    ["gcsVersioning", "gcsRetention"]),

  slide(35, "gcp", "Pub/Sub notifications는 GCS 변경을 이벤트 스트림으로 노출한다",
    "객체 변경 이벤트는 Pub/Sub topic으로 전달되어 서버리스나 worker 기반 후처리를 시작합니다.",
    [
      "Bucket은 object finalize, delete, metadata update 같은 event를 Pub/Sub topic으로 보낼 수 있습니다.",
      "Subscriber는 at-least-once delivery를 전제로 idempotency와 retry/backoff를 구현해야 합니다.",
      "Event payload에는 bucket, object name, generation 같은 후처리 식별자가 들어갑니다."
    ],
    "GCS 이벤트는 처리 시작 신호이지 처리 완료 신호가 아닙니다. downstream DB와 search index는 별도의 상태 전이를 가져야 합니다.",
    flow("GCS event path", [["Object finalize", "new generation"], ["Pub/Sub", "delivery"], ["Worker", "process"], ["State", "indexed/published"]]),
    "Configure Pub/Sub notifications for Cloud Storage",
    ["gcsPubSub"]),

  slide(36, "gcp", "GCS resumable upload와 compose는 대용량 객체 처리의 핵심 도구다",
    "불안정한 네트워크와 병렬 업로드를 전제로 session, offset, checksum을 설계합니다.",
    [
      "Resumable upload는 세션 URI를 통해 중단된 업로드를 이어갈 수 있게 합니다.",
      "Compose operation은 여러 객체를 하나로 합쳐 client-side chunk upload나 server-side assembly에 활용할 수 있습니다.",
      "CRC32C와 MD5 검증 정보를 활용하면 전송 중 손상과 저장 무결성 확인을 명시적으로 할 수 있습니다."
    ],
    "대용량 업로드는 API 하나가 아니라 상태 머신입니다. init, upload, verify, compose, publish, cleanup의 실패 지점을 모두 설계해야 합니다.",
    flow("GCS large object", [["Start session", "resumable URI"], ["Upload chunks", "offset retry"], ["Verify", "CRC32C/MD5"], ["Publish", "DB state"]]),
    "Cloud Storage upload documentation",
    ["gcsIntro"]),

  slide(37, "gcp", "Storage Insights와 Inventory 계열 데이터는 bucket 운영을 분석 문제로 만든다",
    "대규모 환경에서는 어떤 객체가 어디에 얼마나 있는지 쿼리 가능한 데이터셋으로 봐야 합니다.",
    [
      "Storage Insights datasets는 Cloud Storage 환경의 visibility와 insight를 제공하는 관리 데이터셋입니다.",
      "객체 metadata export와 usage log를 BigQuery로 분석하면 lifecycle 후보와 비용 이상치를 찾을 수 있습니다.",
      "prefix와 tag 전략이 좋을수록 비용 배분과 삭제 후보 추출이 단순해집니다."
    ],
    "운영자는 객체 목록을 사람이 훑는 것이 아니라 inventory를 질의합니다. 저장소 운영은 결국 analytics workload가 됩니다.",
    cards("GCS operations data", [["Insights", "environment visibility"], ["Usage logs", "access and lifecycle"], ["BigQuery", "query patterns"], ["Lifecycle", "policy feedback"]]),
    "Storage Insights datasets; Object Lifecycle Management",
    ["gcsInsights", "gcsLifecycle"]),

  slide(38, "gcp", "BigQuery, Dataflow, GKE와 연결될 때 GCS는 데이터 플랫폼의 landing zone이 된다",
    "Cloud Storage는 분석과 ML 파이프라인에서 raw data, staging, checkpoint, artifact 저장소로 쓰입니다.",
    [
      "BigQuery external table이나 load job은 GCS 객체 레이아웃과 format에 영향을 받습니다.",
      "Dataflow/Spark는 object listing, small file, region locality, shuffle/staging 위치의 영향을 받습니다.",
      "ML artifact와 feature 데이터는 보존 기간, lineage, 접근 권한이 모델 재현성과 연결됩니다."
    ],
    "데이터 플랫폼에서 GCS bucket은 단순 업로드 대상이 아니라 schema, catalog, region, IAM, lifecycle이 엮인 landing zone입니다.",
    matrix("GCS as platform", [["BigQuery", "load/external data"], ["Dataflow", "staging and output"], ["GKE", "artifact/log"], ["ML", "dataset/model lineage"]]),
    "Cloud Storage overview; Google Cloud analytics docs",
    ["gcsIntro"]),

  slide(39, "architecture", "직접 업로드 아키텍처는 권한 위임과 상태 머신의 조합이다",
    "서버가 파일 바이트를 프록시하지 않게 하되, 권한과 검증은 서버가 통제해야 합니다.",
    [
      "API는 사용자 인증, quota, content policy를 확인한 뒤 짧은 수명의 upload URL이나 token을 발급합니다.",
      "Client는 storage에 직접 업로드하고, callback이나 event pipeline이 scan/transform/index 상태를 갱신합니다.",
      "서비스 공개는 upload 완료가 아니라 validation 완료와 metadata DB commit 이후에 일어나야 합니다."
    ],
    "이 패턴의 핵심 실패는 orphan object, DB row 없는 object, scan 전 공개 object, 중복 event입니다. 상태 머신으로 다뤄야 합니다.",
    flow("Direct upload state", [["Request", "auth and quota"], ["Upload", "temporary grant"], ["Process", "scan/resize"], ["Publish", "DB visible"]]),
    "Provider upload and event docs",
    ["awsMultipart", "azureIntro", "gcsIntro"]),

  slide(40, "architecture", "멀티테넌트 저장소는 prefix, tag, policy, KMS key 경계를 맞춰야 한다",
    "tenant isolation은 bucket을 나눌지 prefix를 나눌지보다 감사와 blast radius가 더 중요합니다.",
    [
      "Bucket-per-tenant는 강한 격리와 정책 단순성을 주지만 운영 객체 수와 IaC 관리가 늘어납니다.",
      "Prefix-per-tenant는 효율적이지만 policy condition, inventory query, delete operation을 정교하게 설계해야 합니다.",
      "KMS key, access log, lifecycle, cost allocation tag가 tenant 경계와 어긋나면 사고 분석이 어려워집니다."
    ],
    "테넌트 삭제는 DB row 삭제가 아니라 object delete job, version cleanup, retention exception, audit evidence까지 포함합니다.",
    table("Tenant layout", ["전략", "장점", "위험"], [["Bucket per tenant", "strong boundary", "many resources"], ["Prefix per tenant", "simple fleet", "policy complexity"], ["Tag boundary", "analytics/cost", "not hard isolation"], ["Key per tenant", "crypto isolation", "key ops burden"]]),
    "Provider IAM, lifecycle, and KMS docs",
    ["aws", "azureSecurity", "gcsIntro"]),

  slide(41, "architecture", "CDN 앞의 객체 스토리지는 immutable asset pipeline으로 설계한다",
    "사용자에게 보이는 URL은 cache와 rollback의 단위이므로 build artifact처럼 다룹니다.",
    [
      "원본 파일과 파생 파일은 versioned key로 저장하고, CDN에는 긴 TTL과 immutable header를 줄 수 있습니다.",
      "같은 URL overwrite는 cache invalidation 비용과 stale content 문제를 만듭니다.",
      "private media는 signed URL/cookie, origin access identity/control, token exchange로 직접 bucket 공개를 피합니다."
    ],
    "정적 파일 배포의 좋은 key는 content hash를 포함합니다. /app.4f3a.js처럼 바뀌면 새 URL, 안 바뀌면 영구 캐시가 가능합니다.",
    flow("Media delivery", [["Original", "private raw"], ["Derivative", "webp/hls"], ["CDN", "cache policy"], ["Client", "immutable URL"]]),
    "Provider CDN and object storage integration docs",
    ["aws", "azureArchitecture", "gcsIntro"]),

  slide(42, "architecture", "보안 사고는 public bucket 하나가 아니라 제어 경계 실패로 발생한다",
    "노출, 권한 상승, 서명 URL 유출, 로그 속 개인정보, KMS 권한 장애를 함께 모델링해야 합니다.",
    [
      "Public access는 account/org policy로 차단하고 예외는 리뷰 가능한 IaC로만 열어야 합니다.",
      "Signed URL은 bearer token이므로 만료 시간과 scope를 줄이고 로그/analytics에 전체 URL이 남지 않게 해야 합니다.",
      "KMS key policy가 틀리면 객체는 있어도 읽을 수 없는 장애가 생기며, 반대로 넓으면 복호화 경계가 무너집니다."
    ],
    "스토리지 보안 리뷰는 'bucket public인가' 한 줄이 아니라 identity, network, encryption, retention, audit, event pipeline을 모두 체크합니다.",
    matrix("Threat model", [["Exposure", "public or leaked URL"], ["Tamper", "overwrite/delete"], ["Exfiltration", "bulk download"], ["Lockout", "KMS/IAM denial"], ["Poisoning", "malicious upload"], ["Cost attack", "egress/request spike"]]),
    "AWS/Azure/GCP security recommendations",
    ["aws", "azureSecurity", "gcsIntro"]),

  slide(43, "architecture", "암호화는 기본값이 아니라 키 수명주기 운영이다",
    "서버 측 암호화가 켜져 있어도 key ownership, rotation, audit, deletion protection이 설계 대상입니다.",
    [
      "Provider-managed key는 운영이 단순하지만 규제와 조직 통제 요구를 만족하지 못할 수 있습니다.",
      "Customer-managed KMS key는 접근 경계와 감사가 강해지지만 key policy 오류가 서비스 장애가 됩니다.",
      "Envelope encryption, per-tenant key, key rotation, key disable drill은 데이터 보호와 운영 부담의 균형입니다."
    ],
    "키를 삭제하거나 비활성화하면 객체 삭제보다 더 큰 장애가 됩니다. key admin과 data admin을 분리하고 break-glass 절차를 문서화해야 합니다.",
    table("Encryption choices", ["모델", "장점", "주의점"], [["Provider key", "low ops", "less control"], ["CMK", "audit/control", "policy complexity"], ["Per-tenant key", "isolation", "key sprawl"], ["Client-side", "max control", "search/process limits"]]),
    "Provider encryption and KMS docs",
    ["aws", "azureSecurity", "gcsIntro"]),

  slide(44, "architecture", "관측성은 bytes 저장량보다 요청 모양과 정책 효과를 본다",
    "storage observability는 capacity, request, error, latency, lifecycle, replication, egress를 나눠 봅니다.",
    [
      "4xx/5xx, SlowDown/throttling, auth failure, KMS denial, signed URL misuse는 서로 다른 대응이 필요합니다.",
      "Lifecycle transition과 deletion volume은 비용 최적화와 데이터 유실 위험을 동시에 보여줍니다.",
      "Replication lag, failed operations, inventory freshness는 DR과 compliance의 실제 상태입니다."
    ],
    "대시보드는 TB 총량 하나로 끝나지 않습니다. 요청당 비용, egress 상위 prefix, orphan objects, stale temporary uploads가 더 실무적인 지표입니다.",
    cards("Storage SLO signals", [["Availability", "request success"], ["Latency", "p95/p99 read"], ["Cost", "egress/request/retrieval"], ["Protection", "versioning/lock coverage"], ["Drift", "public/policy changes"], ["Pipeline", "event backlog"]]),
    "AWS S3 Storage Lens; Azure architecture best practices; GCS Insights",
    ["awsStorageLens", "azureArchitecture", "gcsInsights"]),

  slide(45, "architecture", "비용 모델은 저장 GB보다 요청, 송신, 복구, 최소 보관 기간이 더 어렵다",
    "객체 스토리지 비용은 capacity, operation, transfer, retrieval, monitoring, replication이 합쳐집니다.",
    [
      "작은 객체가 많으면 GB는 작아도 LIST/GET/metadata 작업 비용과 query planning 비용이 커질 수 있습니다.",
      "인터넷 egress와 cross-region transfer는 저장비보다 훨씬 빠르게 비용을 키울 수 있습니다.",
      "Archive 계층은 저장비가 낮아도 retrieval, rehydration, early deletion, restore time을 함께 계산해야 합니다."
    ],
    "비용 최적화의 순서는 삭제가 아니라 측정입니다. inventory, access log, prefix/tag cost allocation을 먼저 만들고 정책을 적용합니다.",
    table("Cost dimensions", ["항목", "증가 원인", "완화 방법"], [["Capacity", "old data", "lifecycle/retention"], ["Requests", "small objects", "batch/cache"], ["Egress", "internet/cross-region", "CDN/locality"], ["Retrieval", "archive reads", "restore planning"], ["Replication", "DR copies", "scope filters"]]),
    "Provider pricing and lifecycle docs",
    ["awsClasses", "azureTiers", "gcsClasses"]),

  slide(46, "architecture", "DR은 복제 설정이 아니라 복원 절차와 권한 분리다",
    "RPO/RTO는 숫자가 아니라 어떤 데이터, 어떤 계정, 어떤 권한으로 복구할지의 계약입니다.",
    [
      "동일 계정 복제는 실수와 공격이 같이 전파될 수 있으므로 cross-account 또는 별도 subscription/project를 검토합니다.",
      "복구 테스트는 객체 목록, version restore, KMS decrypt, application metadata rebuild를 모두 포함해야 합니다.",
      "Immutable backup은 삭제를 막지만 잘못된 데이터를 영원히 보관할 수도 있으므로 retention과 검증이 필요합니다."
    ],
    "백업의 완료 기준은 '저장했다'가 아니라 '정해진 시간 안에 서비스가 읽을 수 있게 되돌렸다'입니다.",
    flow("Recovery drill", [["Detect", "incident scope"], ["Isolate", "credentials/policy"], ["Restore", "objects + metadata"], ["Verify", "application reads"]]),
    "Provider replication, object lock, and redundancy docs",
    ["awsObjectLock", "azureRedundancy", "gcsRetention"]),

  slide(47, "architecture", "AWS, Azure, Google의 차이는 이름보다 기본 경계와 통합 방식에서 나온다",
    "세 서비스는 모두 객체 저장소지만 account/project, policy, event, analytics 통합이 다릅니다.",
    [
      "AWS S3는 bucket policy, IAM, access point, EventBridge/SQS/Lambda, Athena/Glue와 강하게 연결됩니다.",
      "Azure Blob은 storage account, container, Entra ID/RBAC, SAS, Event Grid, ADLS Gen2/Synapse와 연결됩니다.",
      "Google Cloud Storage는 project/bucket IAM, uniform access, Pub/Sub, BigQuery/Dataflow와 연결됩니다."
    ],
    "멀티클라우드 추상화는 PUT/GET만 숨기기 쉽습니다. 실제 어려움은 IAM, KMS, event, lifecycle, cost, audit semantic 차이입니다.",
    table("Provider comparison", ["축", "AWS S3", "Azure Blob", "GCS"], [["큰 경계", "Account/Bucket", "Storage Account", "Project/Bucket"], ["권한", "IAM + bucket policy", "Entra RBAC + SAS", "IAM + UBLA"], ["이벤트", "SQS/Lambda/EventBridge", "Event Grid/Functions", "Pub/Sub"], ["분석", "Athena/Glue", "ADLS/Synapse", "BigQuery/Dataflow"]]),
    "AWS, Azure, and Google Cloud official storage docs",
    ["aws", "azureIntro", "gcsIntro"]),

  slide(48, "architecture", "최종 설계는 객체 하나가 아니라 데이터 제품의 수명주기를 다룬다",
    "업로드, 검증, 파생물 생성, 공개, 보관, 감사, 삭제까지 하나의 설계 문서로 연결해야 합니다.",
    [
      "사진 서비스는 원본, thumbnail, moderation result, metadata DB, CDN URL, deletion request가 하나의 제품 수명주기입니다.",
      "로그 보관소는 ingestion, partition, compression, catalog, retention, legal hold, query cost가 함께 설계됩니다.",
      "백업 저장소는 immutability, cross-account restore, KMS recovery, drill evidence까지 포함해야 신뢰할 수 있습니다."
    ],
    "강연의 결론은 특정 버튼 위치가 아니라 설계 질문입니다. 어떤 객체가 있고, 누가 읽고, 무엇이 실패하며, 언제 지우고, 어떻게 복구하는가를 끝까지 추적해야 합니다.",
    matrix("Design checklist", [["Object model", "key, metadata, version"], ["Access", "IAM, token, network"], ["Pipeline", "event, scan, transform"], ["Cost", "class, request, egress"], ["Protection", "version, lock, backup"], ["Operations", "metrics, audit, drill"]]),
    "Official provider documentation and architecture guidance",
    ["aws", "azureArchitecture", "gcsIntro"])
];

const deepCategoryMap = {
  model: "cs",
  architecture: "ops"
};

const slides = [
  ...introSlides,
  ...deepSlidesBase.map((item) => ({
    ...item,
    no: item.no + introSlides.length,
    cat: deepCategoryMap[item.cat] ?? item.cat
  }))
];

const totalMinutes = slides.reduce((sum, item) => sum + item.minutes, 0);

function replaceBetween(source, startNeedle, endNeedle, replacement) {
  const start = source.indexOf(startNeedle);
  if (start < 0) throw new Error(`Missing start marker: ${startNeedle}`);
  const end = source.indexOf(endNeedle, start);
  if (end < 0) throw new Error(`Missing end marker: ${endNeedle}`);
  return source.slice(0, start) + replacement + source.slice(end);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^가-힣a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function writeInteractive() {
  let html = fs.readFileSync(interactivePath, "utf8");
  const dataBlock = [
    `    const categories = ${JSON.stringify(categories, null, 6)};`,
    "",
    `    const sourceLinks = ${JSON.stringify(sourceLinks, null, 6)};`,
    "",
    `    const slides = ${JSON.stringify(slides, null, 10)};`,
    ""
  ].join("\n");

  html = replaceBetween(html, "    const categories = [", "    const categoryById", dataBlock);
  html = html
    .replace(/const categoryById\s+const categoryById =/, "const categoryById =")
    .replace(/<title>클라우드 스토리지[^<]*<\/title>/, "<title>클라우드 스토리지 입문부터 심화까지</title>")
    .replace(/<h1>클라우드 스토리지(?: 심화)?<\/h1>/, "<h1>클라우드 스토리지</h1>")
    .replace(
      /<p>(?:2시간 입문 강연용 HTML 자료\.|AWS S3, Azure Blob Storage, Google Cloud Storage를 나눠 보는 컴퓨터공학 전공자용 심화 강연 자료입니다\.|처음 듣는 사람도 이해하는[\s\S]*?강연 자료입니다\.)<\/p>/,
      "<p>처음 듣는 사람도 이해하는 쉬운 설명에서 시작해 컴공 전공자가 알아야 할 객체 스토리지 모델, AWS S3, Azure Blob Storage, Google Cloud Storage, 운영 심화까지 이어지는 강연 자료입니다.</p>"
    )
    .replace(/slide\.no === 1 \|\| slide\.no === 30/g, "slide.no === 1 || slide.no === slides.length")
    .replace(/slideCount\.textContent = `\$\{String\(slide\.no\)\.padStart\(2, "0"\)\} \/ 30`;/, 'slideCount.textContent = `${String(slide.no).padStart(2, "0")} / ${slides.length}`;')
    .replace(/progressLabel\.textContent = `\$\{String\(slide\.no\)\.padStart\(2, "0"\)\} \/ 30`;/, 'progressLabel.textContent = `${String(slide.no).padStart(2, "0")} / ${slides.length}`;')
    .replace('<div class="section-title">Lecture points</div>', '<div class="section-title">핵심 내용</div>')
    .replace('<div class="field-note">${escapeHtml(slide.field)}</div>', '<div class="field-note"><span class="field-label">상세 해설</span>${escapeHtml(slide.field)}</div>')
    .replace(/<span class="field-label">심화 해설<\/span>/g, '<span class="field-label">상세 해설</span>');

  fs.writeFileSync(interactivePath, html);
}

function writeNotes() {
  const categoryById = Object.fromEntries(categories.map((cat) => [cat.id, cat]));
  const md = [
    "# 클라우드 스토리지 입문부터 심화까지 강연 노트",
    "",
    "대상: 클라우드 스토리지를 처음 듣는 사람부터 컴퓨터공학 전공 학생까지. 쉬운 파일 생애주기 설명에서 시작해 객체 스토리지의 시스템 모델, AWS S3, Azure Blob Storage, Google Cloud Storage, 운영 심화까지 이어진다.",
    "",
    `구성: ${slides.length}개 탭, 총 ${totalMinutes}분 기준. 각 탭은 강연에서 그대로 읽고 확장 설명할 수 있는 내용 중심으로 작성했다.`,
    "",
    "## 전체 흐름",
    "",
    ...categories.map((cat) => `- ${cat.range}: ${cat.label}`),
    "",
    "## 슬라이드별 노트",
    "",
    ...slides.flatMap((item) => [
      `### ${String(item.no).padStart(2, "0")}. ${item.title} (${item.minutes}분)`,
      "",
      `분류: ${categoryById[item.cat].label}`,
      "",
      `핵심 메시지: ${item.claim}`,
      "",
      ...item.points.map((point) => `- ${point}`),
      "",
      `상세 해설: ${item.field}`,
      "",
      `출처/근거: ${item.source}`,
      ""
    ]),
    "## 공식 문서 링크",
    "",
    ...Object.entries(sourceLinks).map(([key, url]) => `- ${key}: ${url}`),
    ""
  ].join("\n");

  const toc = slides.map((item) => `<li><a href="#${slug(`${item.no} ${item.title}`)}">${String(item.no).padStart(2, "0")}. ${escapeHtml(item.title)}</a></li>`).join("");
  const sections = slides.map((item) => {
    const id = slug(`${item.no} ${item.title}`);
    return `<section class="note-section" id="${escapeHtml(id)}">
          <p class="meta">${escapeHtml(categoryById[item.cat].label)} · ${item.minutes}분</p>
          <h3>${String(item.no).padStart(2, "0")}. ${escapeHtml(item.title)}</h3>
          <p><strong>핵심 메시지:</strong> ${escapeHtml(item.claim)}</p>
          <ul>${item.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
          <p><strong>상세 해설:</strong> ${escapeHtml(item.field)}</p>
          <p><strong>출처/근거:</strong> ${escapeHtml(item.source)}</p>
        </section>`;
  }).join("\n");
  const links = Object.entries(sourceLinks).map(([key, url]) => `<li><a href="${escapeHtml(url)}">${escapeHtml(key)}</a></li>`).join("");

  const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cloud Storage Basics to Deep Dive Notes</title>
    <link rel="icon" href="../../favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../../assets/styles.css">
  </head>
  <body>
    <header class="topbar">
      <a class="brand-link" href="../../">Study Archive</a>
      <nav class="nav-links" aria-label="Primary navigation">
        <a href="../../notes/">Notes</a>
        <a href="../">Materials</a>
        <a href="../../labs/">Labs</a>
      </nav>
    </header>
    <main class="document-page">
      <div class="document-kicker">Cloud Storage Basics to Deep Dive</div>
      <article class="document">
        <h1>클라우드 스토리지 입문부터 심화까지 강연 노트</h1>
        <p>클라우드 스토리지를 처음 듣는 사람도 이해할 수 있는 쉬운 설명에서 시작해 컴퓨터공학 전공자가 알아야 할 객체 스토리지 모델, AWS S3, Azure Blob Storage, Google Cloud Storage, 운영 설계까지 이어지는 강연 노트입니다.</p>
        <p>구성: ${slides.length}개 탭, 총 ${totalMinutes}분 기준. 각 항목은 강연 중 그대로 사용할 수 있는 내용 중심으로 작성했습니다.</p>
        <h2>전체 흐름</h2>
        <ul>${categories.map((cat) => `<li>${escapeHtml(cat.range)}: ${escapeHtml(cat.label)}</li>`).join("")}</ul>
        <h2>목차</h2>
        <ol class="compact-toc">${toc}</ol>
        <h2>슬라이드별 노트</h2>
        ${sections}
        <h2>공식 문서 링크</h2>
        <ul>${links}</ul>
      </article>
    </main>
    <script src="../../assets/motion.js"></script>
  </body>
</html>
`;

  fs.writeFileSync(markdownPath, md);
  fs.writeFileSync(notesPath, html);
}

function replaceInFile(file, replacements) {
  const filePath = path.join(root, file);
  let text = fs.readFileSync(filePath, "utf8");
  for (const [pattern, value] of replacements) {
    text = text.replace(pattern, value);
  }
  fs.writeFileSync(filePath, text);
}

function updateIndexes() {
  replaceInFile("materials/cloud-storage/index.html", [
    [/(?:클라우드 스토리지를 원격 폴더가 아니라 데이터 플랫폼의 핵심 컴포넌트로 이해하기 위한 2시간 강연 묶음입니다\.|클라우드 스토리지를 분산 객체 시스템과 데이터 플랫폼 관점에서 이해하기 위한 심화 강연 묶음입니다\.)/, "클라우드 스토리지를 처음 듣는 사람도 따라올 수 있는 쉬운 설명에서 시작해 객체 스토리지 모델, AWS S3, Azure Blob Storage, Google Cloud Storage, 운영 심화까지 이어지는 강연 묶음입니다."],
    [/(?:30개 강연 탭|48개 심화 강연 탭|\d+개 입문\+심화 강연 탭)을 브라우저에서 바로 봅니다\./, `${slides.length}개 입문+심화 강연 탭을 브라우저에서 바로 봅니다.`],
    [/(?:슬라이드별 진행 노트와 공식 문서 링크입니다\.|슬라이드별 심화 해설과 공식 문서 링크입니다\.)/, "슬라이드별 상세 해설과 공식 문서 링크입니다."],
    [/PPTX 원본 파일을 다운로드합니다\./, "초기 PPTX 초안 파일을 다운로드합니다."],
    [/(?:발표자 노트의 원본 Markdown 파일입니다\.|심화 강연 노트의 원본 Markdown 파일입니다\.)/, "입문+심화 강연 노트의 원본 Markdown 파일입니다."]
  ]);

  replaceInFile("materials/index.html", [
    [/(?:컴퓨터공학 전공자 대상 2시간 강연 자료입니다\. 인터랙티브 탭, 발표자 노트, PPTX를 함께 보관합니다\.|컴퓨터공학 전공자 대상 클라우드 스토리지 심화 강연 자료입니다\. \d+개 인터랙티브 탭과 심화 노트를 함께 보관합니다\.)/, `처음 듣는 사람을 위한 쉬운 설명부터 컴퓨터공학 전공자용 심화까지 담은 클라우드 스토리지 강연 자료입니다. ${slides.length}개 인터랙티브 탭과 강연 노트를 함께 보관합니다.`]
  ]);

  replaceInFile("index.html", [
    [/Lecture · (?:2 hours|deep dive|basics to deep dive)/, "Lecture · basics to deep dive"],
    [/(?:객체 스토리지, lifecycle, 보안, CDN, 비용, 백업과 복제까지 이어지는 컴퓨터공학 전공자 대상 강연 자료입니다\.|객체 스토리지 모델, AWS S3, Azure Blob Storage, Google Cloud Storage, 보안, 비용, DR까지 이어지는 컴퓨터공학 전공자 대상 심화 강연 자료입니다\.)/, "클라우드 스토리지의 쉬운 개념 설명에서 시작해 객체 스토리지 모델, AWS S3, Azure Blob Storage, Google Cloud Storage, 보안, 비용, DR까지 이어지는 강연 자료입니다."]
  ]);

  replaceInFile("README.md", [
    [/- `interactive-tabs\.html`(?: \([^)]*\))*/, `- \`interactive-tabs.html\` (${slides.length}개 입문+심화 탭)`],
    [/- `speaker-notes\.html`(?: \([^)]*\))*/, "- `speaker-notes.html` (입문+심화 강연 노트)"]
  ]);
}

writeInteractive();
writeNotes();
updateIndexes();

console.log(JSON.stringify({
  slides: slides.length,
  totalMinutes,
  categories: categories.map((cat) => cat.label)
}, null, 2));
