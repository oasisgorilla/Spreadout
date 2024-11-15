# **연관 페이지 추천 기능을 가진 PDF 뷰어 Spread out**

## 프로젝트 개요

- 프로젝트 기간 :  2024.06.24 ~ 2024.07.27 (5주)
- 프로젝트 설명
    - pdf 파일 형식의 책을 업로드 하면 책을 분석하여 점과 연결의 그래프로 보여주고 챕터간의 관계 및 요약, 키워드를 보여줍니다.
    - 추가로 업로드한 pdf를 읽은 챗봇을 통해서 책의 내용에 대해서 질문하거나 요약하는 등 llm을 사용한 서비스를 제공합니다.
- 프로젝트 배경 및 의도
    - 전공서적, 인문 서적 등 읽기 어려운 책을 좀 더 빠르고 쉽게 읽을 수 있으면 좋겠다는 생각에서 시작한 프로젝트 입니다.
    - 추가로 챕터간 함께 보면 좋은 챕터를 연결하여 좀 더 책을 깊이있게 읽을 수 있도록 했습니다.
    - 책에서 나오는 어려운 단어나 내용을 좀 더 쉽게 설명해줄 수 있는 도우미가 있었으면 좋겠다고 생각했습니다.
- 프로젝트 아키텍처

![image](https://github.com/user-attachments/assets/0b8cf4ee-c035-4bea-a385-7ddbd79df209)

## 기술스택

- 프론트 : Next.js | Recoil | Tailwind css | Axios
- 기타 : React-PDF | D3.js | react-markdown | rehype-raw | remark-gfm | DOMPurify

## 프로젝트 진행 단계

- 프론트
  - PDF 파일 분석 결과를 시각적으로 표현하기 위해 D3.js를 활용하여 챕터 간의 유사도를 그래프로 시각화.
  - React-PDF를 사용하여 PDF 파일을 브라우저에서 직접 렌더링 및 탐색 가능하게 구현.
  - SSE 방식으로 LLM의 응답을 실시간 스트리밍하여 사용자가 빠르게 답변을 확인할 수 있도록 개선.
  - 채팅 UI에 Markdown을 적용하여 구조화된 정보를 깔끔하게 표시.

## 프로젝트 세부 과정

### 프론트
- D3.js를 활용한 챕터 유사도 시각화:
  - Sentence Transformer 모델을 사용하여 챕터 간 유사도를 측정하고, 이 정보를 D3.js를 통해 시각적으로 표현했습니다. 유사한 챕터들을 그룹화하여 독자들이 챕터 간의 관계를 쉽게 이해할 수 있도록 했습니다.

- React-PDF를 사용한 PDF 파일 시각화:
  - 웹 브라우저에서 PDF 파일을 직접 볼 수 있도록 PDF 리더를 구현했습니다. 전체 페이지를 한 번에 로딩하는 대신, 사용자가 선택한 부분만 먼저 로드하고, 이후 스크롤되었을 때 나머지 페이지를 화면에 보여주는 방식으로 최적화했습니다. 이를 통해 초기 로딩 속도를 개선하고, 사용자 경험을 향상시켰습니다.

- LLM 응답 스트리밍 및 UI 개선:
  - AWS Bedrock의 Sonnet3 모델을 사용하여 LLM 응답을 생성하고, 이 응답을 SSE 방식으로 실시간 스트리밍하여 응답 속도를 개선했습니다. 이를 통해 사용자는 더 빠르게 결과를 확인할 수 있었고, UI 만족도가 상승했습니다.

- Markdown 적용 채팅 인터페이스:
  - 사용자의 질문에 대해 구조화된 답변을 제공하기 위해 여러 라이브러리를 사용하여 채팅 인터페이스에 Markdown 형식을 적용했습니다. 이 과정에서 다음과 같은 라이브러리를 활용하였습니다:
  
    1. react-markdown:
          - Markdown 문법을 HTML로 변환해주는 라이브러리로, 사용자가 입력한 텍스트를 Markdown 형식으로 렌더링할 수 있도록 도와줍니다. 이를 통해 사용자는 텍스트를 굵게, 기울임, 링크, 리스트 등 다양한 형식으로 표현할 수 있습니다.

    2. rehype-raw:
          - HTML을 파싱하여 React 컴포넌트로 변환하는 역할을 합니다. 이를 통해 Markdown 내에서 HTML 태그를 사용할 수 있게 해주지만, 원시 HTML을 처리할 때는 보안에 주의해야 합니다.

    3. remark-gfm:
          - GitHub Flavored Markdown(GFM) 기능을 지원하는 라이브러리로, 체크리스트, 테이블, 스트라이크스루 등 GitHub에서 사용되는 확장 Markdown 문법을 지원합니다. 이를 통해 채팅 메시지에서 더욱 풍부한 형식을 사용할 수 있습니다.

    4. DOMPurify:
          - 사용자가 입력한 HTML이나 Markdown을 파싱하여 XSS(Cross-Site Scripting) 공격으로부터 보호하는 역할을 합니다. DOMPurify는 HTML을 필터링하여 잠재적인 보안 위협을 제거하고, 안전한 콘텐츠만을 렌더링하도록 보장합니다. 이 라이브러리를 통해 사용자가 제공한 콘텐츠가 악의적인 스크립트를 포함하지 않도록 하여, 채팅 인터페이스의 보안을 강화했습니다.

   - 이러한 라이브러리들을 조합하여 사용자는 다양한 형식의 텍스트를 안전하게 표시할 수 있고, 악성 코드 삽입으로부터 보호받을 수 있도록 보안성을 확보하였습니다.

## 프로젝트 결과
- 프로젝트 링크 : http://jungledaltong.shop/login
- 프로젝트 개요 github : https://github.com/WA360/Spread_out
- 프로젝트 영상 : https://youtu.be/3ZoiSgs1TYE
  
## 프로젝트 리뷰
이 프로젝트를 통해 LLM(대형 언어 모델) 기반 서비스의 동작 원리를 깊이 이해할 수 있었습니다. 특히, LLM은 입력으로 제한된 텍스트만 받을 수 있기 때문에, 이를 활용한 서비스를 개발할 때 사용자가 제공하는 데이터를 어떻게 전처리할지에 대한 고민이 필요함을 깨달았습니다.

프론트엔드와 백엔드 간의 데이터 통신에서 발생할 수 있는 문제들을 해결하는 과정에서, 프론트엔드가 사용하는 라이브러리의 데이터 타입 요구 사항을 사전에 파악하고, 이를 백엔드에 정확하게 전달하는 것이 원활한 협업과 개발 진행에 얼마나 중요한지 배웠습니다.

또한, PDF 파일을 렌더링하기 위해 react-pdf 라이브러리를 사용하는 과정에서 CORS(Cross-Origin Resource Sharing) 문제를 직면했습니다. 특히, 이 라이브러리는 PDF 파일을 처리하기 위해 웹 워커(Web Worker)를 사용하는데, 이 과정에서 CORS 정책에 의해 파일이 차단될 수 있다는 점을 알게 되었습니다. 이를 해결하기 위해 라이브러리파일을 프로젝트파일에 직접 다운로드하여, 파일이 정상적으로 로드되도록 수정했습니다. 이 경험을 통해 CORS 정책에 대한 이해와 문제 해결 능력을 한층 더 발전시킬 수 있었습니다.
