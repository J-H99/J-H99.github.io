# 클라우드 스토리지 2시간 강연 발표자 노트

대상: 컴퓨터공학 전공 학생. 신입생도 이해할 수 있게 기본 모델에서 시작하고, 후반부는 신입/주니어 엔지니어가 현업 설계 리뷰에서 바로 쓸 수 있는 질문으로 구성한다.

권장 진행: 본문 120분. 각 탭은 기본 4분으로 보고, 질문이 길어지면 마지막 미니 설계 토론에서 흡수한다.

## 전체 흐름

- 0-24분: 저장소의 기본 모델과 객체 스토리지 사고방식
- 24-52분: 주요 클라우드 서비스, 스토리지 클래스, lifecycle, 업로드와 객체 key 설계
- 52-80분: 보안 기초, 이벤트 파이프라인, CDN, 데이터 레이크
- 80-104분: 성능, 비용, 백업, 복제, 모니터링
- 104-120분: 미니 설계 토론과 체크리스트 마무리

## 슬라이드별 노트

### 01. 클라우드 스토리지 (4분)

핵심 메시지: 파일을 올리는 서비스에서 데이터 플랫폼으로
- 도입부에서는 클라우드 스토리지를 '원격 폴더'가 아니라 애플리케이션 아키텍처의 중심 컴포넌트로 소개한다.
- 오늘 다룰 질문: 어디에 저장할까, 누가 접근할까, 언제 지울까, 장애와 비용은 어떻게 관리할까.
- 신입생에게는 파일/폴더에서 출발하고, 후반부에는 실무 설계 리뷰 수준까지 올라간다고 안내한다.
- 출처/근거: AWS S3 User Guide; Azure Blob Storage; Google Cloud Storage docs

### 02. 2시간은 개념에서 운영까지 한 번에 이어진다 (4분)

- 전체 흐름을 먼저 보여준다. 초반은 쉬운 개념, 중반은 구현과 보안, 후반은 비용·운영과 설계 토론이다.
- 각 장이 뒤의 실무 의사결정으로 이어진다는 점을 강조한다.
- 출처/근거: Author synthesis

### 03. 스토리지 선택은 '읽고 쓰는 방식'에서 시작한다 (4분)

- 블록, 파일, 객체 스토리지를 학생들이 이미 아는 개념에 연결한다.
- 블록은 디스크, 파일은 공유 폴더, 객체는 HTTP로 접근하는 큰 key-value 저장소라고 비유한다.
- 객체 스토리지는 rename, append, POSIX lock 같은 파일 시스템 기대와 맞지 않을 수 있다고 짚는다.
- 출처/근거: Author synthesis

### 04. 객체 스토리지는 디렉터리가 아니라 bucket + key + metadata다 (4분)

- 버킷은 네임스페이스와 정책 단위, 키는 객체 식별자, 객체는 바이트와 메타데이터의 묶음이다.
- 슬래시가 있는 key는 UI에서 폴더처럼 보일 뿐, 설계 관점에서는 prefix 규칙이라고 설명한다.
- 버전 관리가 켜지면 같은 key에도 여러 version이 존재할 수 있다.
- 출처/근거: AWS S3 User Guide; Google Cloud Storage overview

### 05. 좋은 저장소는 안 잃고, 빨리 읽고, 싸야 한다: 셋은 함께 움직이지 않는다 (4분)

- 내구성, 가용성, 지연시간, 비용을 분리해서 생각하게 만든다.
- 예: archive는 싸지만 복구 지연이 있고, single-zone은 빠르고 싸도 장애 반경이 다르다.
- 현업에서는 '가장 좋은 저장소'가 아니라 워크로드에 맞는 저장소를 고른다.
- 출처/근거: AWS S3 User Guide; Azure redundancy docs; Google Cloud storage classes

### 06. 클라우드 스토리지는 한 제품이 아니라 제품군이다 (4분)

- 객체 스토리지는 범용 기반이지만 모든 문제의 답은 아니다.
- 데이터베이스, 메시지 큐, 블록 볼륨, 파일 공유, 아카이브, 캐시와의 경계를 설명한다.
- 설계 리뷰에서 '왜 S3가 아니라 DB인가', '왜 DB가 아니라 객체인가'를 묻는다고 소개한다.
- 출처/근거: Author synthesis

### 07. 서비스 이름은 달라도 운영 질문은 거의 같다 (4분)

- S3, Azure Blob, Cloud Storage의 용어를 비교한다.
- 업무에서는 특정 벤더 암기보다 bucket/container, object/blob, lifecycle, IAM, tier 같은 공통 축을 이해하는 것이 중요하다.
- 특정 수치나 가격은 변하므로 공식 문서와 요금 계산기로 확인해야 한다고 말한다.
- 출처/근거: AWS S3; Azure Blob; Google Cloud Storage docs

### 08. 스토리지 클래스는 가격표가 아니라 접근 패턴 선언이다 (4분)

- 자주 읽는 데이터와 거의 안 읽는 데이터를 같은 가격·성능 조건에 두면 비용이 낭비된다.
- Hot/Standard는 즉시 접근, Cool/Nearline/Coldline은 낮은 저장비와 높은 접근 비용, Archive는 복구 지연을 전제로 한다.
- 실무에서는 retention window, retrieval latency, early deletion, minimum object size 같은 조건까지 본다.
- 출처/근거: AWS S3 storage classes; Azure access tiers; Google Cloud storage classes

### 09. 수명주기 정책은 비용 자동화의 첫 번째 도구다 (4분)

- 객체가 오래될수록 읽는 빈도가 줄어드는 워크로드가 많다.
- 수명주기 정책은 age, prefix, tag, version 상태 같은 조건으로 tier 변경이나 삭제를 자동화한다.
- 프로덕션 적용 전 dev 데이터나 prefix 제한으로 테스트하라는 Google Cloud 문서의 주의를 강조한다.
- 출처/근거: AWS S3 Lifecycle; Azure Blob lifecycle; Google Cloud Object Lifecycle Management

### 10. 대부분의 웹 업로드는 서버를 통과하지 않고 직접 스토리지로 간다 (4분)

- 애플리케이션 서버가 파일 바이트를 프록시하면 네트워크와 CPU가 병목이 된다.
- 서버는 인증과 정책 확인만 하고, 짧게 만료되는 presigned URL 또는 SAS 같은 임시 권한을 발급한다.
- 업로드 후에는 DB에 상태를 반영하거나 이벤트로 후처리를 시작한다.
- 출처/근거: AWS S3 presigned URL docs

### 11. 대용량 파일은 여러 조각으로 올려 실패 범위를 줄인다 (4분)

- AWS는 100 MB 이상 객체에 multipart upload 사용을 권장한다.
- 각 part를 독립적으로 재시도할 수 있고, 병렬 업로드로 처리량을 높일 수 있다.
- 완료하지 않은 multipart upload는 비용이 생길 수 있으므로 lifecycle로 abort 규칙을 둔다.
- 출처/근거: AWS S3 multipart upload docs

### 12. 객체 key는 이름이 아니라 운영 인덱스다 (4분)

- key는 검색, lifecycle, 권한, 비용 분석, 장애 조사에 영향을 준다.
- 예: tenant/date/type/hash처럼 prefix에 운영 기준을 담으면 정책과 배치 작업이 쉬워진다.
- 개인정보를 key에 직접 넣지 않는 것도 실무 규칙이다.
- 출처/근거: AWS S3 object key docs; Google Cloud object name docs

### 13. 메타데이터와 태그는 나중의 자동화를 만든다 (4분)

- Content-Type, cache-control, checksum, owner, retention class 같은 정보는 후처리와 정책에 쓰인다.
- 태그는 cost allocation, lifecycle, compliance, search indexing의 기준이 될 수 있다.
- 업로드 순간에 메타데이터를 정하는 것이 나중에 전체 객체를 다시 스캔하는 것보다 싸다.
- 출처/근거: AWS S3 object metadata/tags; Google Cloud lifecycle conditions

### 14. 권한 모델은 private by default에서 시작한다 (4분)

- 기본은 비공개, 접근은 최소 권한, 공개는 명시적인 예외라는 원칙을 잡는다.
- 권한은 사람, 서비스 계정, 버킷 정책, prefix 조건, 네트워크 경계, 임시 URL이 함께 만든다.
- ACL보다 정책 기반 접근을 선호하는 흐름을 설명한다.
- 출처/근거: AWS S3 security best practices; Azure security recommendations; GCS IAM docs

### 15. 공개 버킷 사고는 기능 문제가 아니라 경계 설계 실패다 (4분)

- 공개 버킷 사고는 '누가 켰나'보다 '왜 켤 수 있었나'를 보아야 한다.
- 조직 수준 public access block, policy linting, IaC review, sensitive-data scan, access log alert를 단계별 방어선으로 소개한다.
- 신입 엔지니어에게는 콘솔에서 수동으로 공개 전환하는 작업이 얼마나 위험한지 설명한다.
- 출처/근거: AWS S3 Block Public Access; Azure/GCS security guidance

### 16. 암호화는 체크박스가 아니라 키 운영이다 (4분)

- 서버 측 암호화가 기본이어도 키 소유권, 접근 권한, 감사 로그, rotation, deletion protection이 중요하다.
- KMS 권한이 잘못되면 데이터는 있어도 읽을 수 없는 장애가 생길 수 있다.
- 규제 환경에서는 customer-managed key 또는 HSM 요구가 붙을 수 있다.
- 출처/근거: AWS S3 encryption docs; Azure Blob encryption; Google Cloud encryption docs

### 17. 버전 관리와 불변성은 삭제 사고를 복구 가능한 사건으로 바꾼다 (4분)

- 삭제 사고, 랜섬웨어, 잘못된 배치 작업을 예로 든다.
- Versioning은 과거 버전으로 되돌리는 수단이고, Object Lock/immutability는 일정 기간 삭제·변경을 막는 방어선이다.
- 단, 버전이 늘면 비용도 늘기 때문에 lifecycle과 함께 설계해야 한다.
- 출처/근거: AWS S3 Versioning/Object Lock; Azure immutable storage; GCS retention policies

### 18. 객체 업로드는 후처리 파이프라인의 시작 신호가 된다 (4분)

- 업로드 완료 이벤트가 이미지 리사이즈, 바이러스 검사, OCR, 인덱싱, 알림 발송을 시작한다.
- 이벤트는 중복 또는 순서 문제를 가질 수 있으므로 idempotency와 재처리 큐가 필요하다.
- 스토리지와 큐, 함수, DB 상태가 함께 설계되어야 한다.
- 출처/근거: AWS S3 Event Notifications; GCS Pub/Sub notifications; Azure Event Grid

### 19. 정적 미디어 시스템은 스토리지 + CDN + 캐시 규칙이다 (4분)

- 사용자 요청이 직접 스토리지로 가지 않고 CDN edge를 먼저 거치는 구조를 설명한다.
- cache-control, immutable file name, signed URL/cookie, origin access control을 다룬다.
- 이미지 버전 교체는 같은 URL 덮어쓰기보다 fingerprinted key가 안전하다.
- 출처/근거: AWS CloudFront/S3 pattern; Azure CDN/Blob; Cloud CDN/GCS pattern

### 20. 데이터 레이크는 객체 스토리지를 테이블처럼 쓰게 만든다 (4분)

- 객체 스토리지는 저렴하고 내구성이 높지만, 그 자체로 SQL 테이블은 아니다.
- Parquet, Iceberg/Delta/Hudi 같은 파일·테이블 포맷과 카탈로그가 붙어야 분석 플랫폼이 된다.
- Bronze/Silver/Gold 레이어로 원본, 정제, 서비스 데이터를 분리한다.
- 출처/근거: AWS S3 Tables/Iceberg mentions; Google Cloud Storage analytics guidance; Author synthesis

### 21. 성능 병목은 저장소보다 요청 모양에서 자주 생긴다 (4분)

- 작은 객체가 너무 많으면 요청 비용과 list 작업이 병목이 된다.
- 멀리 있는 리전, 동기 프록시 업로드, 높은 동시성, 압축되지 않은 로그 파일이 성능과 비용을 동시에 악화시킨다.
- 해결책은 배치/압축/파티셔닝/CDN/멀티파트/리전 배치다.
- 출처/근거: AWS S3 performance guidance; Google Cloud request rate guidance; Author synthesis

### 22. 스토리지 비용은 GB 저장비보다 요청·송신·복구가 더 위험할 때가 많다 (4분)

- 정확한 가격 숫자는 변하므로 요금 계산기에서 확인해야 한다.
- 모델은 capacity, request, retrieval, data transfer, replication, monitoring, early deletion으로 나누어 본다.
- 초보자는 '싼 archive로 옮기면 끝'이라고 생각하지만 복구와 최소 보관 기간 비용을 놓치기 쉽다.
- 출처/근거: AWS/Azure/GCP pricing model docs; Azure access tier billing notes

### 23. 비용 최적화는 삭제보다 관측에서 시작한다 (4분)

- 무엇이 얼마나 있고 누가 쓰는지 모르면 lifecycle도 위험하다.
- Inventory와 usage metrics로 후보를 찾고, prefix/tag 기준으로 작은 실험을 하며, 정책으로 자동화한다.
- 작은 객체 압축, 중복 제거, 만료 정책이 tier 이동보다 효과적일 수 있다.
- 출처/근거: AWS S3 Storage Lens/Inventory; GCS lifecycle docs; Azure lifecycle docs

### 24. 백업은 저장이 아니라 복원 시간 약속이다 (4분)

- RPO는 얼마나 잃을 수 있는가, RTO는 얼마나 빨리 복구해야 하는가다.
- 데이터를 저장해도 복원 절차가 없으면 백업이 아니다.
- 정기 복원 테스트, 권한 분리, immutable backup, cross-account/cross-region 복제를 설명한다.
- 출처/근거: Author synthesis

### 25. 복제는 가용성만이 아니라 법·지연·비용 선택이다 (4분)

- 동일 리전 복제, 다른 리전 복제, 멀티리전 저장의 차이를 설명한다.
- 규제상 데이터가 특정 국가를 벗어나면 안 되는 경우도 있다.
- 복제는 삭제도 복제할지, 지연을 허용할지, 장애 전환을 누가 할지까지 정해야 한다.
- 출처/근거: AWS S3 Replication; Azure redundancy; Google Cloud location/redundancy docs

### 26. 운영 가능한 버킷은 용량보다 노출과 실패를 먼저 본다 (4분)

- 모니터링 항목을 capacity, request errors, latency, public exposure, lifecycle action, replication lag, cost anomaly로 나눈다.
- 대시보드와 알람은 기술 지표만이 아니라 사고 행동으로 이어져야 한다.
- CloudTrail/Activity logs/Audit logs 같은 감사 로그가 보안 조사에 중요하다.
- 출처/근거: AWS S3 monitoring/logging; Azure Monitor; Google Cloud monitoring

### 27. 사용자 이미지 서비스는 업로드보다 검증과 배포가 더 중요하다 (4분)

- 실무 패턴 하나를 처음부터 끝까지 훑는다.
- Client -> API -> presigned URL -> object storage -> event -> scan/resize -> metadata DB -> CDN 흐름을 설명한다.
- 중요한 실패 사례: 업로드는 됐는데 DB 상태가 없거나, 스캔 전 파일이 공개되는 경우.
- 출처/근거: Author synthesis using provider upload/event/CDN patterns

### 28. 로그 보관소는 저장보다 파티션과 삭제 정책이 성패를 가른다 (4분)

- 하루 수십 GB~TB 로그가 들어오는 상황을 가정한다.
- 시간 파티션, 압축, columnar format, lifecycle, catalog, query engine이 함께 필요하다.
- 무한 보관은 비용과 개인정보 리스크를 키우므로 retention 정책이 설계의 일부다.
- 출처/근거: Author synthesis using object storage and data lake practices

### 29. 미니 설계 과제: 하루 1TB 사진 서비스를 설계해 보자 (4분)

- 학생들에게 3~4명씩 5분 논의하게 한다.
- 질문: 업로드 경로, key 규칙, storage class, 보안 경계, 후처리, 삭제 정책, 장애 복구를 정하게 한다.
- 정답은 하나가 아니라 trade-off를 말할 수 있는지가 핵심이다.
- 출처/근거: Workshop prompt

### 30. 현업에서는 이 10가지만 물어도 설계 품질이 크게 올라간다 (4분)

- 마지막 체크리스트를 읽으며 마무리한다.
- 특정 클라우드의 버튼 위치보다 반복 가능한 질문이 중요하다고 강조한다.
- 공식 문서 링크와 발표자 노트를 공유하면 후속 학습 자료가 된다.
- 출처/근거: Official docs listed in speaker notes

## 공식 문서 링크

- AWS S3 User Guide: https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html
- AWS S3 multipart upload: https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html
- AWS S3 presigned URLs: https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html
- AWS S3 security best practices: https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html
- Azure Blob access tiers: https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview
- Azure Storage redundancy: https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy
- Azure Blob security recommendations: https://learn.microsoft.com/en-us/azure/storage/blobs/security-recommendations
- Google Cloud Storage overview: https://cloud.google.com/storage/docs/introduction
- Google Cloud Storage classes: https://cloud.google.com/storage/docs/storage-classes
- Google Cloud Object Lifecycle Management: https://cloud.google.com/storage/docs/lifecycle

## 수업 운영 팁

- 질문을 던질 때는 '어떤 클라우드가 좋은가'보다 '이 워크로드는 어떤 읽기/쓰기/복구/비용 특성을 가지는가'로 유도한다.
- 가격 숫자는 강의 중 암기시키지 말고, 요금 계산기와 공식 문서로 확인하는 습관을 강조한다.
- 마지막 워크숍에서는 정답보다 포기한 trade-off를 말하게 한다.
