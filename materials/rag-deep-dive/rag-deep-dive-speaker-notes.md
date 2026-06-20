# RAG Deep Dive 강연 노트

대상: RAG를 처음 공부하는 개발자부터 LangChain으로 실제 검색 기반 LLM 애플리케이션을 설계하려는 사람까지. 쉬운 개념 설명에서 시작해 chunking, embeddings, vector search, reranking, LangChain 구현, 평가와 운영까지 이어진다.

구성: 65개 탭, 총 325분 기준. 각 탭은 강연에서 그대로 읽고 확장 설명할 수 있는 내용 중심으로 작성했다.

## 전체 흐름

- 01-11: 처음 이해하기
- 12-23: 지식 준비와 인덱싱
- 24-33: 검색 설계
- 34-43: 답변 생성과 앱 구조
- 44-53: LangChain 구현
- 54-65: 평가와 운영

## 슬라이드별 노트

### 01. RAG가 필요한 순간은 모델이 모르는 최신 지식을 물을 때다 (5분)

분류: 처음 이해하기

핵심 메시지: 사내 환불 정책, 장애 대응 매뉴얼, 제품 릴리스 노트처럼 바뀌는 지식은 모델 안에 항상 들어있지 않습니다.

- LLM은 학습 시점 이후의 문서와 회사 내부 문서를 기본적으로 알지 못합니다.
- 그냥 질문하면 말은 자연스럽지만 오래된 정책이나 추측을 답할 수 있습니다.
- RAG는 질문 순간에 최신 문서를 찾아 보여준 뒤 그 문서 안에서 답하게 만드는 방식입니다.

상세 해설: 예를 들어 '우리 서비스 환불 기간이 며칠인가요?'라는 질문에 모델이 훈련 지식으로 답하면 위험합니다. RAG는 먼저 환불 정책 문서의 최신 버전을 찾고, 그 조각을 답변 재료로 넣어서 '문서에 따르면' 답하게 만듭니다.

출처/근거: LangChain RAG overview

### 02. 초심자는 RAG를 오픈북 시험으로 이해하면 된다 (5분)

분류: 처음 이해하기

핵심 메시지: LLM이 혼자 외워서 답하는 시험이 아니라, 시험 직전에 관련 페이지를 펼쳐놓고 답하는 구조입니다.

- 검색기는 질문에 맞는 페이지를 고르는 역할을 합니다.
- 프롬프트는 고른 페이지를 모델에게 어떻게 읽으라고 지시하는 시험지입니다.
- 모델은 제공된 페이지 안에서 답하고, 페이지가 부족하면 모른다고 말해야 합니다.

상세 해설: 이 비유에서 중요한 점은 책을 아무 페이지나 많이 펼친다고 성적이 좋아지지 않는다는 것입니다. RAG의 핵심은 올바른 페이지를, 읽을 수 있는 크기로, 안전한 규칙과 함께 제공하는 일입니다.

출처/근거: LangChain retrieval building blocks

### 03. 한 번의 RAG 요청은 검색 앱과 생성 앱이 붙은 흐름이다 (5분)

분류: 처음 이해하기

핵심 메시지: 질문이 들어오면 바로 모델로 가지 않고, 검색과 필터링을 거쳐 답변 재료를 만든 뒤 모델을 호출합니다.

- 질문을 검색 가능한 표현으로 정리하고 embedding을 만듭니다.
- vector store와 keyword index에서 후보 문서를 찾고 권한·metadata 조건으로 걸러냅니다.
- reranking과 context assembly를 거친 조각만 모델 입력에 들어갑니다.

상세 해설: RAG를 'LLM 앞에 검색을 붙인 것'이라고만 말하면 구현이 흐립니다. 실제 요청 경로는 query rewrite, retrieve, filter, rerank, assemble, generate, cite, log라는 단계로 쪼개집니다.

출처/근거: LangChain RAG and retrieval overview

### 04. RAG 용어는 다섯 개만 먼저 잡으면 흐름이 보인다 (5분)

분류: 처음 이해하기

핵심 메시지: Document, chunk, embedding, vector store, retriever의 역할을 구분하면 이후 구현 설명을 따라갈 수 있습니다.

- Document는 원문과 metadata를 함께 담은 처리 단위입니다.
- Chunk는 검색을 위해 문서를 잘라낸 조각이고, embedding은 그 조각의 의미 좌표입니다.
- Vector store는 의미 좌표를 저장·검색하고, retriever는 애플리케이션이 호출하는 검색 인터페이스입니다.

상세 해설: 처음부터 모든 고급 기법을 외울 필요는 없습니다. RAG 구현은 결국 문서를 잘게 준비하고, 숫자 좌표로 저장하고, 질문에 가까운 조각을 찾아서, 모델에게 안전하게 건네는 일입니다.

출처/근거: LangChain retrieval building blocks

### 05. RAG는 모델 밖의 기억을 질문 시점에 붙이는 방식이다 (5분)

분류: 처음 이해하기

핵심 메시지: Retrieval-Augmented Generation은 답변 직전에 관련 문서를 찾아 LLM의 입력으로 넣는 설계입니다.

- 모델 파라미터에 모든 지식을 새로 학습시키지 않고, 외부 지식 저장소를 런타임에 조회합니다.
- 사용자 질문, 검색 결과, 프롬프트, 모델 답변이 하나의 요청 경로 안에서 이어집니다.
- 좋은 RAG는 검색과 생성 중 하나만 잘하는 것이 아니라 둘 사이의 계약을 안정적으로 맞춥니다.

상세 해설: 처음에는 'LLM에게 참고 자료를 같이 보여준다'로 이해해도 됩니다. 다만 실무에서는 참고 자료를 어떻게 자르고, 찾고, 걸러서, 어느 정도 신뢰할지까지 설계해야 합니다.

출처/근거: LangChain RAG overview

### 06. RAG와 fine-tuning은 서로 다른 문제를 푼다 (5분)

분류: 처음 이해하기

핵심 메시지: RAG는 바뀌는 지식과 출처가 중요한 질문에 강하고, fine-tuning은 행동 양식과 표현 습관을 바꿀 때 맞습니다.

- 사내 문서, 정책, 매뉴얼, 코드베이스처럼 자주 바뀌는 지식은 RAG로 붙이는 편이 유지보수하기 쉽습니다.
- 모델이 특정 형식으로 답하게 하거나 도메인 말투를 익히게 하는 일은 fine-tuning 후보입니다.
- 두 방법은 경쟁 관계가 아니라 함께 쓰일 수 있지만, 지식 최신성과 추적성은 RAG 쪽 책임입니다.

상세 해설: RAG를 '값싼 fine-tuning'으로 보면 설계가 흐려집니다. RAG의 본질은 외부 지식을 검색 가능한 제품으로 만들고 답변 시점에 근거로 공급하는 것입니다.

출처/근거: LangChain retrieval concepts

### 07. RAG 파이프라인은 ingest와 query 두 경로로 나뉜다 (5분)

분류: 처음 이해하기

핵심 메시지: 문서를 넣는 경로와 질문에 답하는 경로를 분리해서 봐야 병목과 실패 원인을 찾을 수 있습니다.

- Ingest 경로는 원문 수집, 파싱, 정제, chunking, embedding, vector store 저장을 담당합니다.
- Query 경로는 질문 해석, 검색, 필터링, reranking, 프롬프트 구성, 답변 생성을 담당합니다.
- 운영 장애는 대개 두 경로 중 어디가 낡았는지, 느린지, 잘못 잘랐는지에서 시작합니다.

상세 해설: RAG를 한 함수로 구현하면 처음에는 편하지만, 운영 분석이 어려워집니다. 인덱스 생성과 질의 처리의 입력, 출력, 로그를 분리해 두면 품질 개선이 쉬워집니다.

출처/근거: LangChain retrieval building blocks

### 08. RAG의 정답은 문장이 아니라 근거 묶음이다 (5분)

분류: 처음 이해하기

핵심 메시지: 답변 품질을 보려면 최종 문장뿐 아니라 어떤 문서가 들어갔는지 함께 봐야 합니다.

- 사용자에게 보이는 답은 생성 결과지만, 시스템 품질은 검색된 문서의 적합도에서 크게 결정됩니다.
- 출처, 문서 버전, 섹션, 작성일, 권한 범위가 답변과 함께 추적되어야 합니다.
- 근거가 없는 답변은 말이 자연스러워도 RAG 관점에서는 실패입니다.

상세 해설: RAG 시스템은 '답을 잘 말하는 챗봇'이 아니라 '질문에 맞는 근거를 찾아 그 근거 안에서 답하는 시스템'입니다. 그래서 citation과 metadata 설계가 초반부터 필요합니다.

출처/근거: LangSmith RAG evaluation concepts

### 09. RAG 실패는 hallucination보다 먼저 retrieval 실패로 온다 (5분)

분류: 처음 이해하기

핵심 메시지: 틀린 답의 원인을 생성 모델 탓으로만 보면 검색 품질 문제를 놓칩니다.

- 문서가 색인되지 않았거나 최신 버전이 아니면 아무리 좋은 모델도 올바른 근거를 볼 수 없습니다.
- 검색은 되었지만 질문과 맞지 않는 조각이 들어오면 모델은 엉뚱한 문서를 그럴듯하게 요약합니다.
- 문서 안의 악성 지시문이나 권한 밖 정보가 들어오면 prompt injection과 data leakage 위험이 생깁니다.

상세 해설: RAG 디버깅의 첫 질문은 '모델이 왜 틀렸나'가 아니라 '모델이 무엇을 보고 답했나'입니다. 입력 컨텍스트를 보면 실패가 검색, 필터, 프롬프트, 생성 중 어디인지 보입니다.

출처/근거: LangSmith evaluation and intermediate-step guidance

### 10. 첫 RAG 설계도는 데이터 제품 설계도에 가깝다 (5분)

분류: 처음 이해하기

핵심 메시지: 어떤 지식을 누가 갱신하고 누가 읽을 수 있는지 정하지 않으면 챗봇 품질도 흔들립니다.

- 원문 저장소, 파서, 색인 주기, 검색 서비스, LLM 호출, 로그 저장소를 하나의 흐름으로 봅니다.
- 권한과 최신성은 나중에 붙이는 부가 기능이 아니라 RAG 답변의 신뢰 조건입니다.
- 초기 MVP라도 문서 소유자, 재색인 주기, 평가 질문 세트는 최소한 정해야 합니다.

상세 해설: RAG는 AI 기능처럼 보이지만 실제로는 문서 파이프라인, 검색 시스템, 프롬프트 설계, 운영 관측성이 합쳐진 데이터 제품입니다.

출처/근거: LangChain RAG and retrieval overview

### 11. RAG 구축 산출물은 코드보다 먼저 일곱 가지로 정리된다 (5분)

분류: 처음 이해하기

핵심 메시지: 무엇을 만들지 명확히 하면 자료가 개념 설명에서 구현 계획으로 내려옵니다.

- 문서 인벤토리와 metadata 규칙은 어떤 지식을 넣을지 정의합니다.
- 인덱싱 잡과 vector schema는 지식을 검색 가능하게 만드는 구현 단위입니다.
- 검색 API, 프롬프트 계약, 평가셋, 운영 로그는 답변 품질을 지속적으로 개선하는 장치입니다.

상세 해설: 실무 RAG deep dive의 목표는 'RAG가 뭔지 알았다'에서 끝나면 안 됩니다. 끝나고 나면 팀이 바로 문서 목록, DB 스키마, 검색 함수, 평가 질문 세트를 만들 수 있어야 합니다.

출처/근거: LangChain RAG and LangSmith evaluation docs

### 12. RAG에서 문서는 파일이 아니라 검색 단위로 재구성된 데이터다 (5분)

분류: 지식 준비와 인덱싱

핵심 메시지: PDF나 HTML 원본을 그대로 넣는 것이 아니라 질문에 맞게 찾을 수 있는 단위로 바꿔야 합니다.

- 문서 로더는 원본 파일, 웹 페이지, 데이터베이스 row를 공통 Document 형태로 옮기는 역할을 합니다.
- 원문 구조를 잃으면 표, 제목, 코드 블록, 주석이 모두 평평한 텍스트가 되어 검색 품질이 떨어집니다.
- 검색 단위는 사람이 보는 페이지 단위와 다를 수 있으므로 metadata로 원래 위치를 보존합니다.

상세 해설: RAG의 첫 품질은 파싱에서 결정됩니다. 깨진 PDF 텍스트, 빠진 표 헤더, 중복 footer가 들어오면 이후 embedding과 reranking도 그 한계를 그대로 받습니다.

출처/근거: LangChain knowledge-base concepts

### 13. Loader와 parser는 지식 경계를 정하는 입구다 (5분)

분류: 지식 준비와 인덱싱

핵심 메시지: 무엇을 수집하지 않을지 정하는 일이 무엇을 수집할지 정하는 일만큼 중요합니다.

- 웹 페이지는 본문만 가져오고 nav, footer, 광고, 댓글 같은 반복 노이즈를 제외해야 합니다.
- PDF와 슬라이드는 페이지 번호, 제목, 표, 그림 설명을 별도 metadata로 보존하면 추적이 쉬워집니다.
- 코드와 Markdown은 섹션, 함수, 파일 경로 같은 구조가 검색 힌트가 됩니다.

상세 해설: Loader는 단순 입출력 도구처럼 보이지만 실제로는 RAG의 데이터 계약입니다. 이 단계에서 잘못 들어온 문서는 색인 전체에 오래 남습니다.

출처/근거: LangChain retrieval building blocks

### 14. Metadata는 필터이자 출처이자 운영 손잡이다 (5분)

분류: 지식 준비와 인덱싱

핵심 메시지: 문서 조각마다 source, version, tenant, updated_at 같은 정보를 붙여야 검색 이후 제어가 가능합니다.

- 권한 필터는 보통 vector search 전후 metadata 조건으로 적용됩니다.
- 출처 표시와 감사 로그는 chunk가 원문 어디에서 왔는지를 알아야 가능합니다.
- 재색인과 삭제도 document_id, version, checksum 같은 식별자가 있어야 안전합니다.

상세 해설: RAG의 metadata는 장식이 아닙니다. 나중에 '이 답변의 근거 문서가 무엇인가', '퇴사자 문서를 제거했는가', '이 테넌트의 문서만 검색했는가'에 답하기 위한 운영 인덱스입니다.

출처/근거: LangChain retrieval concepts

### 15. Chunking은 글자 수가 아니라 의미 경계 문제다 (5분)

분류: 지식 준비와 인덱싱

핵심 메시지: 문서를 얼마나 크게 자르는지가 recall, precision, 답변 근거성을 동시에 흔듭니다.

- 너무 작게 자르면 필요한 문맥이 흩어지고, 너무 크게 자르면 관련 없는 내용이 함께 들어옵니다.
- 제목, 섹션, 문단, 코드 블록, 표 단위처럼 사람이 읽는 구조를 먼저 고려해야 합니다.
- Overlap은 경계 손실을 줄이지만 중복 검색과 비용을 늘립니다.

상세 해설: Chunk size는 정답 숫자가 없습니다. 질문 유형, 문서 구조, embedding 모델, reranker, 컨텍스트 예산을 함께 보면서 실험으로 정해야 합니다.

출처/근거: LangChain text splitter concepts

### 16. Indexing은 한 번 넣고 끝나는 작업이 아니다 (5분)

분류: 지식 준비와 인덱싱

핵심 메시지: 문서는 바뀌고 삭제되고 권한이 이동하므로 색인도 수명주기를 가져야 합니다.

- 초기 bulk indexing과 이후 incremental update는 실패 복구 방식이 다릅니다.
- 동일 문서가 중복 색인되면 검색 결과가 편향되고 오래된 chunk가 살아남을 수 있습니다.
- 삭제 요청은 원문 저장소뿐 아니라 vector store, cache, 평가 데이터까지 추적해야 합니다.

상세 해설: RAG 운영에서 '문서를 넣었다'는 말은 부족합니다. 어떤 버전을 넣었고, 이전 버전을 지웠고, 실패하면 재시도할 수 있는지를 기록해야 합니다.

출처/근거: LangChain vector store and retriever concepts

### 17. Embedding 모델 선택은 검색 언어와 비용 구조를 바꾼다 (5분)

분류: 지식 준비와 인덱싱

핵심 메시지: 같은 문서라도 embedding 모델이 다르면 가까운 문서의 의미와 점수 분포가 달라집니다.

- 한국어, 영어, 코드, 표, 짧은 FAQ 중 어떤 입력이 많은지에 따라 모델 적합도가 달라집니다.
- 차원 수와 저장량, embedding 호출 비용, 지연시간은 전체 운영 비용에 직접 영향을 줍니다.
- 모델을 바꾸면 기존 벡터를 재색인해야 하므로 마이그레이션 계획이 필요합니다.

상세 해설: Embedding은 텍스트를 숫자로 바꾸는 도구가 아니라 검색 공간을 정의하는 선택입니다. 모델 변경은 데이터베이스 스키마 변경처럼 다뤄야 합니다.

출처/근거: LangChain embedding and vector store concepts

### 18. Vector store 선택은 기존 DB 확장과 전용 DB 사이의 결정이다 (5분)

분류: 지식 준비와 인덱싱

핵심 메시지: 현업에서는 PostgreSQL pgvector처럼 기존 DB에 붙이는 방식과 Pinecone, Weaviate, Qdrant, Milvus 같은 전용 vector DB를 모두 씁니다.

- 이미 PostgreSQL, Elasticsearch, MongoDB, Redis를 운영한다면 기존 운영 경계 안에 vector search를 붙이는 선택이 현실적입니다.
- 대규모 ANN 검색, 낮은 지연시간, managed 운영, hybrid/reranking 기능이 중요하면 전용 vector DB나 검색 엔진을 검토합니다.
- 정답은 제품 인기도가 아니라 데이터 규모, metadata filter, 권한, 운영 인력, 비용, 장애 복구 기준으로 정합니다.

상세 해설: 많이 쓰이는 선택지는 크게 세 부류입니다. 첫째는 pgvector처럼 기존 OLTP DB에 붙이는 방식, 둘째는 Pinecone/Weaviate/Qdrant/Milvus 같은 전용 vector DB, 셋째는 Elasticsearch/MongoDB/Redis처럼 기존 검색·문서·캐시 플랫폼에 vector search를 더하는 방식입니다.

출처/근거: pgvector, Pinecone, Weaviate, Qdrant, Milvus, Elasticsearch, MongoDB, Redis official docs

### 19. PostgreSQL을 이미 쓴다면 pgvector는 좋은 기본 선택지다 (5분)

분류: 지식 준비와 인덱싱

핵심 메시지: RAG MVP와 중간 규모 서비스에서는 문서 row, metadata, 권한 필터, vector를 PostgreSQL 안에서 함께 관리하는 장점이 큽니다.

- pgvector는 PostgreSQL extension으로 vector similarity search를 제공하며 HNSW와 IVFFlat index를 사용할 수 있습니다.
- 문서 metadata, tenant_id, ACL, updated_at 같은 필터를 SQL 조건과 함께 다루기 쉬워 RAG 권한 모델과 잘 맞습니다.
- 다만 초대규모 벡터, 매우 낮은 latency, 복잡한 hybrid/rerank 운영이 핵심이면 전용 vector DB와 비교 평가가 필요합니다.

상세 해설: PostgreSQL을 이미 운영하는 팀이라면 pgvector는 도입 비용이 낮고 백업, 배포, 권한, transaction 운영 모델을 재사용할 수 있습니다. 하지만 vector index는 일반 B-tree와 다르고 recall/latency 튜닝이 필요하므로 평가셋으로 top-k, index type, filter 조건을 함께 검증해야 합니다.

출처/근거: pgvector official project documentation

### 20. Chunk metadata는 나중에 붙이는 설명이 아니라 검색 조건이다 (5분)

분류: 지식 준비와 인덱싱

핵심 메시지: chunk 하나마다 출처, 권한, 버전, 섹션, 시간 정보를 넣어야 필터링과 citation이 가능합니다.

- source_uri와 section_path는 사용자가 답변 근거를 다시 열어볼 수 있게 합니다.
- tenant, visibility, owner_team은 검색 전에 접근 가능한 문서만 남기는 기준입니다.
- checksum, parser_version, embedding_model은 재색인과 회귀 분석에 필요합니다.

상세 해설: metadata를 대충 두면 MVP는 빨리 보일 수 있지만 운영에서 바로 막힙니다. '왜 이 문서가 검색됐지?', '삭제한 문서가 왜 나왔지?', '모델 바꾼 뒤 성능이 왜 흔들리지?'에 답할 수 없기 때문입니다.

출처/근거: LangChain Document metadata and retrieval concepts

### 21. pgvector 스키마는 문서 테이블과 chunk 테이블을 분리하는 편이 안전하다 (5분)

분류: 지식 준비와 인덱싱

핵심 메시지: 문서 단위 수명주기와 chunk 단위 검색을 나누면 재색인, 삭제, 출처 추적이 쉬워집니다.

- documents 테이블은 원문 단위의 소유자, 버전, checksum, 갱신 시간을 갖습니다.
- chunks 테이블은 content, metadata, embedding, chunk_no를 갖고 document_id로 연결합니다.
- HNSW/IVFFlat vector index와 metadata GIN index를 함께 검토합니다.

상세 해설: PostgreSQL을 이미 운영한다면 pgvector는 RAG MVP의 좋은 기본값입니다. 다만 '문서 row에 벡터 하나'가 아니라, 문서와 chunk를 분리해 실제 검색 단위와 운영 단위를 맞추는 설계가 필요합니다.

출처/근거: pgvector official documentation

### 22. 인덱싱 잡은 upsert와 삭제를 같은 수준으로 설계해야 한다 (5분)

분류: 지식 준비와 인덱싱

핵심 메시지: 문서를 넣는 코드만 있으면 오래된 chunk, 중복 chunk, 권한이 바뀐 chunk가 남습니다.

- source checksum이 같으면 재색인을 건너뛰고, 바뀌면 document_id 기준으로 chunk를 교체합니다.
- embedding_model이나 splitter_version이 바뀌면 전체 재색인 또는 shadow index를 계획합니다.
- 실패한 문서는 retry queue와 검증 로그에 남겨 운영자가 볼 수 있어야 합니다.

상세 해설: RAG는 데이터 파이프라인입니다. 성공 경로만 구현하면 데모는 됩니다. 하지만 실무에서는 삭제, 롤백, 부분 실패, 모델 교체, parser 버전 변경이 반드시 옵니다.

출처/근거: LangChain indexing and retrieval concepts

### 23. pgvector 검색 SQL은 의미 검색과 업무 필터를 함께 가져야 한다 (5분)

분류: 지식 준비와 인덱싱

핵심 메시지: 실무 쿼리는 nearest neighbor만이 아니라 visibility, tenant, product 같은 조건을 같이 봅니다.

- 권한·테넌트 필터 없이 top-k를 뽑으면 모델에 보여주면 안 되는 문서가 들어갈 수 있습니다.
- metadata 조건은 DB index와 함께 설계해야 지연시간이 예측 가능합니다.
- distance 점수만 저장하지 말고 어떤 필터와 embedding 모델로 검색했는지 로그에 남깁니다.

상세 해설: pgvector의 장점은 vector search를 기존 PostgreSQL 조건과 함께 쓸 수 있다는 점입니다. 이미 Postgres를 쓰는 팀에게 이 운영 단순성은 꽤 큰 장점입니다.

출처/근거: pgvector official documentation

### 24. Vector search는 의미가 비슷한 조각을 찾는 첫 번째 후보 생성기다 (5분)

분류: 검색 설계

핵심 메시지: Embedding 공간에서 가까운 chunk를 찾지만, 가까움이 곧 정답이라는 뜻은 아닙니다.

- Vector search는 exact keyword가 달라도 의미가 비슷한 문서를 찾는 데 강합니다.
- 고유명사, 버전 번호, 오류 코드, 짧은 약어는 순수 의미 검색만으로 놓칠 수 있습니다.
- top-k 후보는 최종 컨텍스트가 아니라 후속 필터와 reranking의 입력으로 보는 편이 안전합니다.

상세 해설: RAG 검색은 한 번의 similarity_search로 끝나지 않습니다. vector search는 넓게 후보를 모으는 단계이고, 이후 질문 의도와 권한, 최신성, 근거 품질로 좁혀 갑니다.

출처/근거: LangChain vector store and retriever concepts

### 25. Keyword search와 hybrid search는 여전히 중요하다 (5분)

분류: 검색 설계

핵심 메시지: 의미 검색은 강력하지만 정확한 토큰을 찾는 문제에서는 전통 검색이 더 안정적일 수 있습니다.

- 정책 번호, API 이름, 에러 코드, 함수명은 keyword search가 더 직접적으로 찾습니다.
- Hybrid search는 BM25 같은 sparse 검색과 dense vector 검색을 결합해 후보 누락을 줄입니다.
- 최종 랭킹에서는 두 점수의 스케일과 가중치를 실험으로 맞춰야 합니다.

상세 해설: RAG를 벡터 DB 하나로만 이해하면 실무 검색의 절반을 놓칩니다. 사용자의 질문에는 의미 질문과 정확한 토큰 검색이 섞여 있습니다.

출처/근거: LangChain retriever concepts

### 26. Metadata filter는 검색 품질보다 먼저 보안 경계다 (5분)

분류: 검색 설계

핵심 메시지: 테넌트, 사용자 권한, 문서 상태를 검색 조건에 넣지 않으면 답변 전에 데이터가 새어 나갑니다.

- 권한 없는 문서는 LLM 입력에 들어가기 전에 제외되어야 합니다.
- 문서 visibility, product, version, region 같은 조건은 질문 의도와 함께 적용됩니다.
- 필터를 검색 후에만 적용하면 후보 수가 부족해질 수 있어 search strategy와 함께 설계해야 합니다.

상세 해설: RAG 보안의 기본 원칙은 '모델에게 보이면 이미 노출된 것'입니다. 권한 필터는 프롬프트 지시보다 데이터 접근 계층에서 먼저 처리해야 합니다.

출처/근거: LangChain retrieval concepts

### 27. Top-k는 답변 품질의 다이얼이지 고정 상수가 아니다 (5분)

분류: 검색 설계

핵심 메시지: 얼마나 많은 문서를 넣을지는 질문 유형과 컨텍스트 예산에 따라 달라집니다.

- k가 작으면 핵심 문서를 놓칠 수 있고, k가 크면 불필요한 문맥이 답변을 흐립니다.
- MMR 같은 다양성 전략은 비슷한 chunk만 반복되는 문제를 줄일 수 있습니다.
- 질문이 비교형인지, 요약형인지, 사실 확인형인지에 따라 필요한 후보 수가 다릅니다.

상세 해설: 검색 파라미터는 운영 중 조정되는 품질 레버입니다. top-k, score threshold, diversity, filter 범위를 평가 데이터로 같이 관리해야 합니다.

출처/근거: LangChain retriever concepts

### 28. Reranking은 후보 검색과 최종 컨텍스트 사이의 품질 게이트다 (5분)

분류: 검색 설계

핵심 메시지: 넓게 찾은 후보를 질문 기준으로 다시 정렬하면 precision을 올릴 수 있습니다.

- Vector search는 빠르게 후보를 모으고, reranker는 더 비싼 방식으로 상위 후보를 재평가합니다.
- Cross-encoder나 LLM 기반 reranking은 정확도를 높일 수 있지만 지연시간과 비용이 늘어납니다.
- Reranking 후에는 상위 몇 개만 프롬프트에 넣어 컨텍스트 노이즈를 줄입니다.

상세 해설: 실무 RAG에서는 recall을 위해 넓게 찾고, reranking으로 좁히는 2단계 검색이 흔합니다. 검색 후보와 최종 컨텍스트를 분리해 로그로 남기면 개선 포인트가 보입니다.

출처/근거: LangChain retrieval and intermediate-step evaluation concepts

### 29. Query rewriting은 사용자의 말과 문서의 말을 맞춘다 (5분)

분류: 검색 설계

핵심 메시지: 사용자 질문이 짧거나 대화 맥락에 기대면 검색용 질의로 다시 써야 할 수 있습니다.

- 대화형 질문의 '그거', '아까 정책' 같은 표현은 독립 검색 질의로 풀어야 합니다.
- 문서가 쓰는 공식 용어와 사용자가 쓰는 일상어가 다르면 동의어 확장이 필요합니다.
- Rewrite 결과가 원 질문의 의도를 바꾸지 않도록 평가와 로그가 필요합니다.

상세 해설: Query rewriting은 검색 성능을 올리지만 위험도 있습니다. 질문을 너무 적극적으로 바꾸면 사용자가 묻지 않은 범위까지 검색하게 됩니다.

출처/근거: LangChain custom workflow with query rewriting

### 30. Multi-query와 decomposition은 어려운 질문을 나눠 찾는다 (5분)

분류: 검색 설계

핵심 메시지: 한 번의 검색으로 답하기 어려운 질문은 여러 검색 의도로 분해하는 편이 낫습니다.

- 비교 질문은 각 비교 대상별 검색과 공통 기준 검색이 모두 필요할 수 있습니다.
- 원인 분석 질문은 증상, 환경, 변경 이력, 해결책을 별도 검색해야 할 수 있습니다.
- 검색을 많이 할수록 recall은 늘지만 latency, 비용, 중복 컨텍스트도 늘어납니다.

상세 해설: RAG가 복잡해지는 순간은 '문서 하나 찾기'를 넘어 여러 근거를 조합해야 할 때입니다. 이때는 검색 계획 자체가 워크플로우가 됩니다.

출처/근거: LangChain and LangGraph workflow concepts

### 31. Conversational RAG는 chat history를 그대로 검색에 넣지 않는다 (5분)

분류: 검색 설계

핵심 메시지: 대화 기록은 검색 질의 재작성과 답변 맥락에 다르게 사용해야 합니다.

- 검색에는 현재 질문이 독립적으로 이해되도록 필요한 대화 맥락만 반영합니다.
- 긴 대화 전체를 넣으면 이전 주제의 노이즈가 검색과 생성 모두를 방해합니다.
- 사용자별 memory와 문서 검색 결과는 권한, 보존 기간, 민감도 기준이 다릅니다.

상세 해설: 대화형 RAG는 'history + query로 검색'이라는 단순한 패턴에서 금방 한계가 옵니다. history는 질문 해석용, retrieved context는 근거용으로 역할을 나누는 것이 좋습니다.

출처/근거: LangChain RAG and custom workflow guidance

### 32. 검색 API는 top-k 결과가 아니라 후보 생성 파이프라인을 돌려야 한다 (5분)

분류: 검색 설계

핵심 메시지: 좋은 retriever는 query rewrite, hybrid search, filter, rerank, context trimming을 하나의 계약으로 묶습니다.

- vector search는 의미 후보를 넓게 찾고, keyword search는 정확한 용어·코드·정책명을 보완합니다.
- reranker는 후보 20~100개 중 모델에 넣을 최종 3~8개를 고르는 품질 게이트입니다.
- 최종 context는 token budget과 citation 단위를 기준으로 잘라야 합니다.

상세 해설: 검색 API가 `similarity_search(question, k=5)` 하나로 끝나면 디버깅이 어렵습니다. 실무 API는 각 단계의 입력과 출력, 점수, 필터 사유를 trace에 남기는 쪽이 좋습니다.

출처/근거: LangChain retrieval and advanced RAG references

### 33. Retrieval log는 RAG 품질 개선의 원자료다 (5분)

분류: 검색 설계

핵심 메시지: 답이 틀렸을 때 어느 단계가 실패했는지 보려면 검색 로그가 답변 로그만큼 자세해야 합니다.

- query, rewritten_query, filters, candidate_count, selected_chunk_ids를 남깁니다.
- 각 chunk의 distance, keyword score, rerank score, dropped_reason을 추적합니다.
- 사용자에게 보인 citation과 실제 모델 입력 context가 일치하는지 검증합니다.

상세 해설: RAG 개선은 감으로 하기 어렵습니다. 검색 로그가 있으면 '문서가 없었나', '있었는데 못 찾았나', '찾았는데 잘랐나', '넣었는데 모델이 무시했나'를 구분할 수 있습니다.

출처/근거: LangSmith intermediate-step tracing

### 34. 프롬프트는 근거 사용 규칙을 명시해야 한다 (5분)

분류: 답변 생성과 앱 구조

핵심 메시지: 검색 결과를 넣는 것만으로 모델이 항상 근거 안에서 답하지는 않습니다.

- 컨텍스트에 없는 내용은 모른다고 말하게 하고, 추측과 근거를 분리하게 해야 합니다.
- 문서 안의 지시문은 데이터로 취급하고 시스템 지시를 덮어쓰지 못하게 해야 합니다.
- 답변 형식, 인용 방식, 충돌 문서 처리 방식을 프롬프트 계약으로 둡니다.

상세 해설: RAG 프롬프트의 핵심은 친절한 말투보다 근거 경계입니다. 모델이 본문을 요약하는지, 문서 밖 지식을 섞는지, 출처를 어떻게 표시하는지 명확히 정해야 합니다.

출처/근거: LangChain RAG prompt guidance

### 35. Context window는 쓰레기통이 아니라 예산이다 (5분)

분류: 답변 생성과 앱 구조

핵심 메시지: 넣을 수 있다고 다 넣으면 중요한 근거가 희석되고 비용과 지연시간이 늘어납니다.

- 검색 결과는 압축, 정렬, 중복 제거를 거쳐 모델이 읽을 수 있는 형태로 들어가야 합니다.
- 표, 코드, 정책 문장은 요약하면 의미가 바뀔 수 있어 원문 보존이 필요할 때가 있습니다.
- 긴 컨텍스트 모델을 써도 retrieval precision과 근거 추적은 여전히 필요합니다.

상세 해설: 컨텍스트 예산은 RAG 설계의 실제 제약입니다. 어떤 근거를 버리고 어떤 근거를 남길지 결정하는 순간 시스템의 판단 기준이 드러납니다.

출처/근거: LangChain RAG and retrieval concepts

### 36. Citation은 UI 장식이 아니라 디버깅 인터페이스다 (5분)

분류: 답변 생성과 앱 구조

핵심 메시지: 사용자가 출처를 열어볼 수 있고 개발자가 검색 실패를 추적할 수 있어야 합니다.

- 출처 링크는 문서 전체가 아니라 가능하면 섹션, 페이지, chunk 위치까지 가리켜야 합니다.
- 답변의 어떤 문장이 어떤 근거에서 나왔는지 연결하면 hallucination 분석이 쉬워집니다.
- 문서가 삭제되거나 권한이 바뀌면 과거 citation을 어떻게 처리할지도 정해야 합니다.

상세 해설: Citation이 있으면 사용자는 답변을 맹신하지 않고 검토할 수 있습니다. 운영자는 틀린 답변의 원인이 검색인지 생성인지 빠르게 좁힐 수 있습니다.

출처/근거: LangSmith RAG evaluation concepts

### 37. Chain, tool, agent는 질문의 불확실성에 따라 고른다 (5분)

분류: 답변 생성과 앱 구조

핵심 메시지: 항상 agent가 정답은 아니며, 단순 Q&A는 고정 chain이 더 빠르고 예측 가능합니다.

- 고정 RAG chain은 검색 한 번과 답변 한 번처럼 경로가 명확한 질문에 좋습니다.
- Retrieval tool을 가진 agent는 검색이 필요한지, 몇 번 검색할지 모델이 판단하는 구조입니다.
- 워크플로우가 복잡하면 LangGraph처럼 상태와 노드를 명시하는 방식이 디버깅에 유리합니다.

상세 해설: 오케스트레이션 선택은 멋의 문제가 아니라 실패 분석의 문제입니다. 예측 가능한 질문은 단순하게, 분기와 반복이 필요한 질문은 명시적 워크플로우로 가는 편이 안전합니다.

출처/근거: LangChain RAG agent and LangGraph custom workflow docs

### 38. Structured output은 RAG 답변을 애플리케이션 데이터로 만든다 (5분)

분류: 답변 생성과 앱 구조

핵심 메시지: 답변이 화면에 보이는 문장만이 아니라 상태, 인용, 불확실성까지 포함할 수 있습니다.

- JSON schema나 typed output을 쓰면 citation, confidence, missing_info를 분리해 UI에 전달할 수 있습니다.
- 정책 답변은 결론, 근거, 예외, 후속 질문을 구조화하면 사용자 경험이 좋아집니다.
- 구조화가 강할수록 검증은 쉬워지지만 프롬프트와 evaluator도 함께 관리해야 합니다.

상세 해설: RAG 결과를 문자열 하나로만 다루면 앱에서 할 수 있는 일이 줄어듭니다. 구조화된 답변은 검색 품질, UI 표시, 후속 행동을 연결하는 계약입니다.

출처/근거: LangChain structured workflow concepts

### 39. Prompt injection 방어는 RAG의 필수 설계다 (5분)

분류: 답변 생성과 앱 구조

핵심 메시지: 검색된 문서는 신뢰 데이터가 아니라 사용자가 간접적으로 공급한 입력일 수 있습니다.

- 문서 안의 '이전 지시를 무시하라' 같은 문장은 실행 지시가 아니라 인용 데이터로 취급해야 합니다.
- 검색 결과와 시스템 프롬프트의 경계를 명확히 하고, 모델에게 문서 내 지시를 따르지 말라고 알려야 합니다.
- 민감 작업은 RAG 답변만으로 실행하지 말고 별도 권한 확인과 도구 정책을 둡니다.

상세 해설: RAG는 외부 문서를 모델 입력으로 가져오므로 공격 표면이 넓습니다. 특히 웹 문서, 사용자 업로드 파일, 티켓 댓글을 검색한다면 문서 자체를 안전하지 않은 입력으로 봐야 합니다.

출처/근거: LangChain RAG prompt guidance

### 40. 프롬프트 계약은 답변 스타일보다 근거 사용 규칙이 먼저다 (5분)

분류: 답변 생성과 앱 구조

핵심 메시지: RAG 프롬프트는 retrieved context를 데이터로 취급하고, 문서 안 지시문을 따르지 말라는 규칙을 가져야 합니다.

- context에 없는 사실은 추가하지 않고 모르면 모른다고 답하게 합니다.
- 충돌하는 문서가 있으면 최신성, 버전, 우선순위 규칙을 적용하거나 충돌을 보고합니다.
- 답변마다 사용한 source id를 남겨 UI와 로그가 같은 근거를 보게 합니다.

상세 해설: LangChain RAG 문서의 agent 예제도 검색 context 안 지시문을 무시하라는 system prompt를 둡니다. 이 한 줄이 prompt injection 방어의 시작점입니다.

출처/근거: LangChain RAG retrieval tool prompt guidance

### 41. RAG 응답은 문자열 하나가 아니라 answer, sources, trace로 나가야 한다 (5분)

분류: 답변 생성과 앱 구조

핵심 메시지: 애플리케이션에서 쓰려면 답변 본문과 출처, 불확실성, 검색 로그 식별자를 구조화해야 합니다.

- UI는 sources 배열로 citation을 렌더링하고 사용자가 원문으로 돌아갈 수 있게 합니다.
- trace_id는 운영자가 LangSmith나 내부 로그에서 같은 요청을 재현하는 키가 됩니다.
- confidence는 모델의 자기확신이 아니라 검색 적합도, 근거 충돌, 평가 결과를 조합한 제품 신호로 다룹니다.

상세 해설: RAG를 챗봇 문자열로만 반환하면 제품화가 어려워집니다. 감사, CS, 디버깅, 사용자 피드백이 모두 source와 trace를 필요로 하기 때문입니다.

출처/근거: LangSmith trace and RAG evaluation guidance

### 42. 문서가 부족할 때의 무응답 정책이 있어야 hallucination을 줄인다 (5분)

분류: 답변 생성과 앱 구조

핵심 메시지: RAG는 항상 답하는 시스템이 아니라 근거가 충분할 때만 답하는 시스템이어야 합니다.

- 검색 결과가 없거나 score threshold를 넘지 못하면 답변 생성 대신 보완 질문을 합니다.
- 서로 충돌하는 문서가 있으면 최신 문서 기준, 관리자 확인, 충돌 노출 중 하나를 선택합니다.
- 사용자에게 '못 찾음'을 말하더라도 운영 로그에는 누락된 질문을 수집해 인덱싱 backlog로 보냅니다.

상세 해설: 좋은 RAG는 모르는 것을 빨리 인정합니다. 그 대신 어떤 문서가 부족했는지, 다음에 무엇을 색인해야 하는지 학습 루프를 남깁니다.

출처/근거: RAG evaluation and groundedness guidance

### 43. 서비스 API는 검색 지연과 생성 지연을 분리해서 설계한다 (5분)

분류: 답변 생성과 앱 구조

핵심 메시지: 사용자는 하나의 답변을 보지만 서버는 retrieval latency, rerank latency, model latency를 따로 측정해야 합니다.

- 검색과 rerank는 캐시·병렬화·timeout 정책을 다르게 둘 수 있습니다.
- 생성은 streaming UI가 유효하지만, citation은 최종 context 확정 뒤에 함께 검증해야 합니다.
- API 응답에는 partial answer보다 근거 누락이나 timeout 상태를 명확히 표시하는 편이 안전합니다.

상세 해설: RAG가 느릴 때 '모델이 느리다'고만 보면 원인을 놓칩니다. hybrid search, metadata filter, rerank, LLM 호출이 각각 다른 병목을 만들기 때문입니다.

출처/근거: LangChain RAG and tracing concepts

### 44. LangChain의 RAG 구성 요소는 Document, splitter, vector store, retriever다 (5분)

분류: LangChain 구현

핵심 메시지: 현재 LangChain 문서는 RAG를 문서 준비와 런타임 검색/생성으로 나눠 설명합니다.

- Document는 page_content와 metadata를 가진 공통 단위입니다.
- Text splitter는 긴 문서를 검색 가능한 chunk로 나눕니다.
- Embedding model과 vector store는 chunk를 검색 공간에 넣고, retriever는 질의에 맞는 문서를 돌려줍니다.

상세 해설: LangChain을 공부할 때는 클래스 이름보다 데이터 흐름을 먼저 잡는 것이 좋습니다. Document가 어떻게 만들어지고 retriever가 어떤 Document를 돌려주는지 보면 대부분의 예제가 읽힙니다.

출처/근거: LangChain retrieval building blocks

### 45. LangChain 인덱싱 예제는 splitter와 vector store를 연결한다 (5분)

분류: LangChain 구현

핵심 메시지: 작은 예제라도 chunk size, overlap, embedding, collection 이름은 운영 결정입니다.

- RecursiveCharacterTextSplitter는 일반 텍스트를 계층적 구분자 기준으로 나누는 기본 선택지입니다.
- Chroma 같은 vector store는 실습에 좋지만, 운영에서는 보존성, 백업, 권한, 검색 기능을 따져야 합니다.
- 색인 코드는 한 번 실행되는 노트북이 아니라 재실행 가능한 ingestion job으로 발전해야 합니다.

상세 해설: LangChain 문서의 RAG 예제는 `RecursiveCharacterTextSplitter`, embeddings, vector store를 사용해 chunk를 색인하는 흐름을 보여줍니다. 실무에서는 여기에 metadata, idempotent upsert, 삭제 처리가 붙습니다.

출처/근거: LangChain RAG tutorial

### 46. Retriever는 vector store를 애플리케이션 경계로 감싼다 (5분)

분류: LangChain 구현

핵심 메시지: 애플리케이션은 vector store 세부 구현보다 retriever 계약에 기대는 편이 유지보수하기 쉽습니다.

- retriever는 질문을 받아 관련 Document 목록을 반환하는 인터페이스입니다.
- search_kwargs로 k 같은 검색 파라미터를 지정할 수 있지만, 값은 평가로 조정해야 합니다.
- metadata filter와 reranking을 붙이면 retriever는 단순 similarity search보다 넓은 검색 정책이 됩니다.

상세 해설: Vector store를 직접 호출할 수도 있지만, 앱 코드에는 retriever 경계를 두는 편이 좋습니다. 이후 hybrid search나 권한 필터를 추가해도 호출부의 의미가 덜 흔들립니다.

출처/근거: LangChain retrieval concepts

### 47. LangChain RAG agent는 검색을 tool로 노출할 수 있다 (5분)

분류: LangChain 구현

핵심 메시지: 질문에 따라 검색 도구를 호출하게 만들면 단순 chain보다 유연하지만 추적과 제한이 더 중요합니다.

- LangChain 문서는 `@tool(response_format="content_and_artifact")`로 검색 결과와 원본 Document를 함께 돌려주는 패턴을 보여줍니다.
- `create_agent`는 모델이 retrieval tool을 사용해 답변하도록 구성할 수 있습니다.
- 검색 tool 설명, 반환 형식, 호출 횟수 제한이 agent 품질과 비용을 좌우합니다.

상세 해설: 검색을 tool로 만들면 agent가 필요할 때 찾아보는 형태가 됩니다. 하지만 모든 질문에 무제한 검색을 허용하면 비용과 지연시간이 커지므로 정책이 필요합니다.

출처/근거: LangChain RAG tutorial

### 48. LangGraph는 복잡한 RAG 흐름을 상태 그래프로 명시한다 (5분)

분류: LangChain 구현

핵심 메시지: 질의 재작성, 검색, 평가, 재시도, 답변 생성을 노드로 나누면 디버깅이 쉬워집니다.

- LangChain 문서의 custom workflow 예시는 query rewrite, retrieve, agent call을 LangGraph StateGraph로 연결합니다.
- 검색 결과가 부족하면 다시 쓰기, 다른 retriever 사용, human review로 분기할 수 있습니다.
- 상태 그래프는 agent에게 모든 제어를 맡기는 대신 시스템이 허용한 경로를 명시합니다.

상세 해설: RAG가 MVP를 넘어서면 단순 함수보다 상태 흐름이 중요해집니다. LangGraph는 이런 흐름을 노드와 edge로 표현해 관측과 테스트를 쉽게 합니다.

출처/근거: LangChain custom workflow with LangGraph

### 49. LangChain은 빠른 조립에 좋지만 제품 경계는 직접 정해야 한다 (5분)

분류: LangChain 구현

핵심 메시지: 프레임워크가 loader와 retriever를 제공해도 권한, 배포, 평가, 장애 처리는 애플리케이션 책임입니다.

- LangChain 예제는 학습 속도를 높이지만 운영 데이터 계약을 대신 정해주지는 않습니다.
- Vector store, embedding provider, model provider는 교체 가능하게 감싸두면 실험이 쉬워집니다.
- LangSmith 같은 관측/평가 도구는 품질 루프를 만들 때 유용하지만 평가 기준은 직접 설계해야 합니다.

상세 해설: LangChain을 '마법 라이브러리'로 기대하면 실망하기 쉽습니다. 좋은 사용법은 RAG의 경계를 이해한 뒤 반복적인 연결 코드를 줄이고 실험 루프를 빠르게 만드는 것입니다.

출처/근거: LangChain and LangSmith docs

### 50. LangChain 최소 구현은 splitter, vector_store, retriever를 먼저 연결한다 (5분)

분류: LangChain 구현

핵심 메시지: 최신 LangChain RAG 문서는 Document를 split하고 vector store에 add_documents한 뒤 retrieval tool이나 retriever로 호출하는 흐름을 보여줍니다.

- RecursiveCharacterTextSplitter는 문서를 chunk로 나누는 기본 출발점입니다.
- vector_store.add_documents는 chunk와 metadata를 함께 색인합니다.
- vector_store.as_retriever 또는 similarity_search가 애플리케이션 검색 경계가 됩니다.

상세 해설: 강의에서는 프레임워크 이름보다 경계가 중요합니다. LangChain은 이 경계를 빠르게 조립하게 해주지만, metadata와 권한, 평가 기준은 팀이 직접 정해야 합니다.

출처/근거: LangChain RAG and retrieval documentation

### 51. LangChain에서는 retrieval을 tool로 만들어 agent가 호출하게 할 수 있다 (5분)

분류: LangChain 구현

핵심 메시지: 검색 결과를 모델 입력 문자열과 원본 Document artifact로 함께 돌려주면 citation과 디버깅이 쉬워집니다.

- 공식 RAG 예제는 `@tool(response_format="content_and_artifact")`로 검색 tool을 만듭니다.
- serialized context는 모델이 읽고, raw documents는 애플리케이션이 출처와 metadata로 사용합니다.
- system prompt에는 검색 context를 데이터로만 취급하고 부족하면 모른다고 답하라는 규칙을 둡니다.

상세 해설: 이 패턴은 초보자가 RAG를 구현할 때 좋은 시작점입니다. 다만 agent가 검색을 건너뛰어도 되는지, 항상 검색해야 하는지 같은 제품 정책은 별도 테스트가 필요합니다.

출처/근거: LangChain RAG tool documentation

### 52. 복잡한 RAG는 LangGraph로 단계를 명시하면 추적과 테스트가 쉬워진다 (5분)

분류: LangChain 구현

핵심 메시지: 질의 재작성, 검색, 답변 생성을 별도 노드로 나누면 각 단계의 실패를 독립적으로 볼 수 있습니다.

- rewrite 노드는 사용자의 말을 문서 용어에 맞는 검색 질의로 바꿉니다.
- retrieve 노드는 deterministic하게 retriever를 호출해 문서를 반환합니다.
- generate 노드는 context와 질문을 받아 citation이 있는 답변을 만듭니다.

상세 해설: LangGraph는 RAG를 '마법의 chain'이 아니라 상태 그래프로 보이게 합니다. 운영 관측성과 테스트가 중요한 실무 RAG에서는 이 명시성이 큰 장점입니다.

출처/근거: LangChain custom workflow documentation

### 53. 프로젝트 구조는 demo notebook이 아니라 운영 경계로 나눠야 한다 (5분)

분류: LangChain 구현

핵심 메시지: 실무 RAG 코드는 ingest, retrieval, generation, evaluation, observability가 분리되어야 수정과 테스트가 쉽습니다.

- ingest 모듈은 source connector와 parser, splitter, embedding, upsert를 소유합니다.
- retrieval 모듈은 query rewrite, filter, hybrid search, rerank, context assembly를 소유합니다.
- evaluation 모듈은 고정 질문 세트와 LangSmith 또는 내부 평가 runner를 소유합니다.

상세 해설: LangChain 예제를 그대로 제품 구조로 쓰면 금방 커집니다. 강의 자료에는 최소 코드뿐 아니라 파일 경계 예시를 넣어 실무자가 어디부터 분리할지 보이게 해야 합니다.

출처/근거: LangChain RAG and LangSmith evaluation guidance

### 54. RAG 평가는 retrieval과 generation을 따로 봐야 한다 (5분)

분류: 평가와 운영

핵심 메시지: 최종 답변 점수만 보면 검색이 틀렸는지 생성이 틀렸는지 알 수 없습니다.

- Retrieval 평가는 질문에 필요한 문서가 top-k 안에 들어왔는지를 봅니다.
- Groundedness 평가는 답변이 실제 검색 문서에 근거하는지를 봅니다.
- Answer correctness는 정답성과 표현 품질을 보되, 근거 없는 정답을 별도로 경계해야 합니다.

상세 해설: LangSmith의 RAG 평가 안내도 relevance, groundedness, retrieval relevance처럼 단계를 나눠 측정하는 흐름을 보여줍니다. RAG 품질은 한 숫자로 끝나지 않습니다.

출처/근거: LangSmith RAG evaluation tutorial

### 55. 평가 데이터셋은 실제 사용자의 질문 모양을 닮아야 한다 (5분)

분류: 평가와 운영

핵심 메시지: 좋은 RAG 테스트는 정답뿐 아니라 필요한 근거 문서도 함께 가집니다.

- FAQ식 쉬운 질문만 있으면 복합 질문, 모호한 질문, 최신성 질문에서 품질을 보장하지 못합니다.
- 정답 문장, 필수 문서 id, 허용 가능한 답변 범위를 함께 저장하면 평가가 안정적입니다.
- 실패 사례를 평가셋에 계속 추가해야 운영 품질이 좋아집니다.

상세 해설: RAG 평가는 모델 벤치마크보다 제품 회귀 테스트에 가깝습니다. 사용자가 실제로 묻는 질문과 조직이 틀리면 안 되는 질문을 모아야 합니다.

출처/근거: LangSmith dataset and evaluator concepts

### 56. Tracing은 RAG의 블랙박스를 열어준다 (5분)

분류: 평가와 운영

핵심 메시지: 각 요청에서 어떤 질의로 무엇을 찾고 어떤 프롬프트를 만들었는지 남겨야 디버깅할 수 있습니다.

- 로그에는 원 질문, rewritten query, retriever 설정, 후보 문서, 최종 컨텍스트, 모델 응답이 필요합니다.
- 민감 데이터가 로그에 남지 않도록 masking과 보존 기간을 정해야 합니다.
- 사용자 피드백은 trace와 연결될 때 실제 개선 데이터가 됩니다.

상세 해설: RAG 운영자는 답변 문자열만 봐서는 아무것도 고칠 수 없습니다. trace는 검색과 생성 사이의 모든 의사결정을 재현하기 위한 증거입니다.

출처/근거: LangSmith intermediate-step evaluation

### 57. Freshness는 재색인 주기와 답변 정책이 함께 만든다 (5분)

분류: 평가와 운영

핵심 메시지: 문서가 바뀌었는데 색인이 늦으면 RAG는 오래된 사실을 자신 있게 말합니다.

- 문서 저장소의 update event를 색인 job과 연결하면 최신성 지연을 줄일 수 있습니다.
- 답변에는 문서 버전과 업데이트 시점을 표시해 사용자가 오래된 근거를 알 수 있게 합니다.
- 정책 문서처럼 민감한 영역은 오래된 색인을 답변 금지로 처리할 수도 있습니다.

상세 해설: 최신성은 단순히 매일 재색인하는 문제가 아닙니다. 어떤 문서는 즉시 반영되어야 하고, 어떤 문서는 검수 후 공개되어야 하며, 어떤 문서는 특정 날짜 이후 유효합니다.

출처/근거: LangChain retrieval and operational evaluation concepts

### 58. 권한 있는 RAG는 검색 전에 사용자 경계를 계산한다 (5분)

분류: 평가와 운영

핵심 메시지: 답변이 친절해도 권한 밖 문서를 보고 만들었다면 보안 사고입니다.

- 사용자 identity, role, tenant, document ACL을 검색 조건에 반영해야 합니다.
- 공유 문서와 비공개 문서가 섞인 저장소에서는 citation 표시도 권한에 따라 달라져야 합니다.
- 권한 변경이나 문서 삭제가 vector store에 늦게 반영되는 시간을 위험으로 관리해야 합니다.

상세 해설: RAG 보안은 프롬프트보다 데이터 접근 제어가 먼저입니다. 모델에게 비밀을 보지 말라고 부탁하는 대신, 비밀이 모델 입력에 들어가지 않게 해야 합니다.

출처/근거: LangChain retrieval concepts

### 59. Latency와 비용은 검색 단계 수가 늘수록 빠르게 커진다 (5분)

분류: 평가와 운영

핵심 메시지: RAG 품질을 올리는 모든 장치가 응답 시간과 비용을 함께 올릴 수 있습니다.

- Query rewrite, multi-query, reranking, long context, evaluator 호출은 모두 추가 지연을 만듭니다.
- 캐시는 embedding, 검색 결과, 최종 답변 중 어느 층을 저장할지에 따라 위험과 효과가 다릅니다.
- 질문 유형별로 fast path와 deep path를 나누면 사용자 경험과 품질의 균형을 맞출 수 있습니다.

상세 해설: 운영 RAG는 최고의 답만 찾는 문제가 아니라 정해진 시간과 비용 안에서 충분히 근거 있는 답을 만드는 문제입니다.

출처/근거: LangChain and LangSmith workflow concepts

### 60. RAG 배포는 모델 배포보다 데이터 배포에 가깝다 (5분)

분류: 평가와 운영

핵심 메시지: 모델 버전, embedding 버전, 인덱스 버전, 프롬프트 버전이 함께 릴리스 단위가 됩니다.

- 프롬프트만 바뀌어도 답변 품질이 바뀌고, embedding 모델만 바뀌어도 검색 결과가 바뀝니다.
- Blue/green index나 shadow evaluation을 두면 새 색인을 실제 사용자 전에 검증할 수 있습니다.
- 롤백하려면 문서 버전과 벡터 인덱스 버전이 남아 있어야 합니다.

상세 해설: RAG 시스템의 배포 산출물은 코드만이 아닙니다. 색인 스냅샷, 평가 결과, 프롬프트, retriever 설정이 함께 묶여야 같은 답변을 재현할 수 있습니다.

출처/근거: LangSmith evaluation workflow

### 61. 최종 RAG 체크리스트는 검색, 근거, 권한, 운영을 함께 묻는다 (5분)

분류: 평가와 운영

핵심 메시지: RAG를 만들 수 있다는 말은 질문에 답할 수 있다는 말이 아니라 신뢰 조건을 증명할 수 있다는 말입니다.

- 필요 문서가 들어오고 최신 상태로 유지되는지 확인합니다.
- 질문에 맞는 근거가 검색되고, 답변이 그 근거 안에 머무르는지 평가합니다.
- 권한, 비용, 지연시간, 추적, 롤백을 운영 기준으로 관리합니다.

상세 해설: RAG deep dive의 결론은 도구 이름이 아닙니다. 좋은 RAG는 문서를 데이터 제품으로 다루고, 검색을 품질 게이트로 다루며, 답변을 근거와 함께 검증 가능한 결과로 다룹니다.

출처/근거: LangChain RAG and LangSmith evaluation docs

### 62. 실무 심화 학습은 고급 기법을 실험 로드맵으로 묶어야 한다 (5분)

분류: 평가와 운영

핵심 메시지: Advanced RAG는 기법 이름을 많이 아는 것보다 어떤 실패를 줄이기 위해 어떤 순서로 실험할지 정하는 일이 중요합니다.

- 먼저 baseline RAG의 chunk size, top-k, metadata, citation 규칙을 고정하고 평가 질문 세트를 만듭니다.
- 그다음 hybrid search, reranking, query rewriting, query decomposition을 하나씩 추가하며 retrieval과 answer 지표를 비교합니다.
- GraphRAG, RAPTOR, agentic RAG는 관계 추론, 긴 문서 요약, 복합 작업 같은 필요가 확인된 뒤 도입합니다.

상세 해설: 실무자에게 필요한 deep dive는 '이 기법도 있다'로 끝나면 약합니다. 각 기법을 어느 실패 유형에 적용하고 어떤 로그와 평가 수치로 성공을 판단할지까지 실험 티켓처럼 정리해야 합니다.

출처/근거: Advanced RAG practitioner guides and search-engineering references

### 63. 실무자용 deep dive는 실습 과제와 평가 로그까지 포함해야 한다 (5분)

분류: 평가와 운영

핵심 메시지: 학습 자료가 실제 역량으로 이어지려면 pgvector baseline, 검색 개선, 평가 대시보드, 보안 테스트를 작은 실습으로 검증해야 합니다.

- PostgreSQL + pgvector로 문서, metadata, ACL, vector를 함께 저장하고 tenant/role 필터가 검색 전에 적용되는지 확인합니다.
- 같은 질문 세트로 vector-only, hybrid, rerank, query rewrite 결과를 비교해 어떤 변경이 recall과 groundedness를 올렸는지 기록합니다.
- LangChain/LangSmith 또는 대체 관측 도구로 검색 후보, 최종 context, 답변, citation, 사용자 피드백을 trace로 남깁니다.

상세 해설: 공부 목표를 'RAG 이해'로 두면 넓고 흐릿합니다. 더 좋은 목표는 작은 운영 가능한 RAG를 만들고, 실패 사례를 평가셋에 넣고, 다음 변경이 품질을 올렸는지 증명하는 것입니다.

출처/근거: RAG evaluation and production feedback-loop guides

### 64. 평가 데이터셋은 정답뿐 아니라 필요한 문서와 금지 문서를 포함해야 한다 (5분)

분류: 평가와 운영

핵심 메시지: RAG 평가는 answer correctness만 보면 부족하고, 어떤 문서를 찾아야 했는지도 함께 봐야 합니다.

- required_sources는 retrieval recall을 검증하고 forbidden_sources는 stale 문서 혼입을 잡습니다.
- user_context는 tenant, role, locale 같은 권한·개인화 조건을 재현합니다.
- expected_answer는 문장 완전일치보다 사실 단위와 근거 일치 기준으로 채점하는 편이 현실적입니다.

상세 해설: LangSmith RAG 평가 문서는 correctness, relevance, groundedness, retrieval relevance를 나눠 평가하는 흐름을 보여줍니다. 자료에도 이 평가 축이 데이터셋 구조로 드러나야 합니다.

출처/근거: LangSmith RAG evaluation tutorial

### 65. 현업 RAG 학습은 실험 backlog까지 있어야 깊어진다 (5분)

분류: 평가와 운영

핵심 메시지: 초심자가 구조를 이해한 뒤 실무자는 chunking, hybrid, rerank, prompt, eval을 바꿔가며 증거를 쌓아야 합니다.

- chunk size와 overlap을 바꿔 retrieval recall과 groundedness를 비교합니다.
- pgvector 단독, hybrid search, reranker 추가의 latency와 품질 차이를 측정합니다.
- LangChain agent 방식과 LangGraph 고정 workflow 방식의 trace와 실패 양상을 비교합니다.

상세 해설: deep dive의 마지막은 체크리스트가 아니라 실험 계획이어야 합니다. 어떤 가설을 세우고, 어떤 metric으로 판단하고, 어떤 trace를 남길지까지 있어야 실무 학습으로 이어집니다.

출처/근거: Advanced RAG and RAG evaluation references

## 공식 문서 링크

- langchainRag: https://docs.langchain.com/oss/python/langchain/rag
- langchainRetrieval: https://docs.langchain.com/oss/python/langchain/retrieval
- langchainKnowledge: https://docs.langchain.com/oss/python/langchain/knowledge-base
- langchainVectorStores: https://docs.langchain.com/oss/python/integrations/vectorstores
- langchainCustomWorkflow: https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow
- langsmithRagEval: https://docs.langchain.com/langsmith/evaluate-rag-tutorial
- langsmithIntermediate: https://docs.langchain.com/langsmith/evaluate-on-intermediate-steps
- pgvector: https://github.com/pgvector/pgvector
- postgresPgvectorRelease: https://www.postgresql.org/about/news/pgvector-080-released-2952/
- pineconeDocs: https://docs.pinecone.io/guides/get-started/overview
- weaviateHybrid: https://docs.weaviate.io/weaviate/search/hybrid
- qdrantIndexing: https://qdrant.tech/documentation/manage-data/indexing/
- milvusHybrid: https://milvus.io/docs/hybrid_search_with_milvus.md
- elasticKnn: https://www.elastic.co/docs/solutions/search/vector/knn
- mongoVector: https://www.mongodb.com/docs/vector-search/
- redisVector: https://redis.io/docs/latest/develop/ai/search-and-query/vectors/
- neo4jAdvancedRag: https://neo4j.com/blog/genai/advanced-rag-techniques/
- pineconeAdvancedRag: https://www.pinecone.io/learn/advanced-rag-techniques/
- meiliRagTechniques: https://www.meilisearch.com/blog/rag-techniques
- evidentlyRagEval: https://www.evidentlyai.com/llm-guide/rag-evaluation
- braintrustRagEval: https://www.braintrust.dev/articles/what-is-rag-evaluation
- qdrantRagEval: https://qdrant.tech/blog/rag-evaluation-guide/
- elasticQueryRewrite: https://www.elastic.co/search-labs/blog/query-rewriting-llm-search-improve
- haystackQueryExpansion: https://haystack.deepset.ai/blog/query-expansion
- textTableBenchmark: https://arxiv.org/html/2604.01733v1
