'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import PDFReader from '@/components/PDFReader';
import Graph from '@/components/Graph/Graph';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { selectedPdfIdState, pdfFileState, selectedTocState } from '@/recoil/atoms';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import axios from 'axios';
import Chat from '@/components/Chat/Chat';

interface TabData {
  key: string;
  title: string;
}

export interface OriginNode {
  bookmarked: number;
  end_page: number;
  group: number;
  id: number;
  level: number;
  name: string;
  pdf_file_id: number;
  start_page: number;
  filename: string;
}

export interface OriginLink {
  id: number;
  pdf_file_id: number;
  similarity: number;
  source: number;
  target: number;
}

export interface OriginSessionNode {
  id: number;
  chapter_id: number;
  name: string;
  level: number;
  user_id: number;
}

export interface OriginSessionLink {
  id: number;
  pdf_file_id: number;
  similarity: number;
  source: number;
  target: number;
}

export interface OriginGraphData {
  nodes: OriginNode[];
  links: OriginLink[];
  session_nodes: OriginSessionNode[];
  session_links: OriginSessionLink[];
}

export default function Page() {
  const selectedPdfId = useRecoilValue(selectedPdfIdState); // 현재 보고 있는 pdf id의 전역상태
  const setPdfFile = useSetRecoilState(pdfFileState); // 현재 보고 있는 pdf파일의 전역상태 설정 함수
  const selectedToc = useRecoilValue(selectedTocState); // 현재 클릭한 챕터의 전역상태
  const [isBookmark, setIsBookmark] = useState(0); // 현재 pdf뷰어에서 보는 챕터의 북마크 여부
  const [tabs1, setTabs1] = useState<TabData[]>([
    // Tabs1에 소속된 Tab들의 정보가 들어있는 배열
    { key: 'diagram', title: 'Diagram' },
    { key: 'bookmarked', title: 'Bookmarked' }, // 기본 포함 탭
  ]);
  const [openTabOrder, setOpenTabOrder] = useState<number[]>([0, 1]);
  const [activeTab1, setActiveTab1] = useState<number>(0); // Tabs1에서 현재 활성화 돼있는 탭을 구분하기 위한 상태
  // Tabs1에 속한 Tab마다 pageNumber를 설정해주기 위한 상태
  const [tabPageNumbers, setTabPageNumbers] = useState<{
    [key: string]: number;
  }>({ diagram: 1 });

  const [tabs2, setTabs2] = useState<TabData[]>([
    // Tabs2에 소속된 Tab들의 정보가 들어있는 배열
    { key: 'chat', title: 'Chat' }, // Chat Tab은 미리 넣어준다.
  ]);
  const [activeTab2, setActiveTab2] = useState<number>(0); // Tabs2에서 현재 활성화 돼있는 탭을 구분하기 위한 상태
  // Tabs2에 속한 Tab들의 SessionNumber를 설정해주기 위한 상태
  const [tabSessionNumbers, setTabSessionNumbers] = useState<{
    [key: string]: number;
  }>({ chat: 0 });

  const [graphData, setGraphData] = useState<OriginGraphData | null>(null); // express서버에서 받아온 그래프 데이터가 담기는 상태
  const [showScale, setShowScale] = useState(false); // scale 변경 시 표시 상태
  const [leftWidth, setLeftWidth] = useState(50); // 왼쪽 패널의 초기 너비를 50%로 설정
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      setLeftWidth(Math.max(30, Math.min(70, newLeftWidth)));
    },
    [isDragging],
  );

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (showScale) {
      const timer = setTimeout(() => {
        setShowScale(false);
      }, 1000); // 1초 후에 사라지도록 설정
      return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 클리어
    }
  }, [showScale]);

  const addTab1 = (pageNumber: number) => {
    // Tabs1에 Tab추가하는 함수
    const newTabKey = `tab-${tabs1.length}`;
    setTabs1([...tabs1, { key: newTabKey, title: `Page ${pageNumber}` }]);
    setActiveTab1(tabs1.length);
    // 해당 pdf뷰어 Tab에 전달할 pageNumber 설정
    setTabPageNumbers({ ...tabPageNumbers, [newTabKey]: pageNumber });
  };

  const removeTab1 = (key: string, index: number) => {
    // Tabs1에 Tab삭제하는 함수
    const newTabs = tabs1.filter((tab) => tab.key !== key);
    // openTabOrder에서 삭제된 탭의 인덱스를 제거하고, 그 이상의 인덱스는 1씩 감소
    const newOpenTabOrder = openTabOrder.reduce<number[]>((acc, current) => {
      if (current < index) {
        acc.push(current); // 삭제 인덱스 전의 값은 그대로 유지
      } else if (current > index) {
        acc.push(current - 1); // 삭제 인덱스 이후의 값은 1 감소
      }
      return acc;
    }, []);

    setOpenTabOrder(newOpenTabOrder);
    setActiveTab1(newOpenTabOrder[0] || 0); // 활성 Tab 설정
    setTabs1(newTabs); // Tab 정보 재설정
    const { [key]: _, ...newTabPageNumbers } = tabPageNumbers;
    setTabPageNumbers(newTabPageNumbers); // Tab pdfReader에 pageNumber 전달
  };

  const removeTab2 = (key: string) => {
    // Tabs2에 Tab삭제하는 함수
    const newTabs = tabs2.filter((tab) => tab.key !== key);
    const newIndex =
      tabs2.findIndex((tab) => tab.key === key) === activeTab2 && activeTab2 > 0
        ? activeTab2 - 1
        : activeTab2;
    setTabs2(newTabs);
    setActiveTab2(newIndex);
    const { [key]: _, ...newTabPageNumbers } = tabSessionNumbers;
    setTabSessionNumbers(newTabPageNumbers);
  };

  const fetchGraphData = async (pdfId: number) => {
    // url, node, link 가져오는 함수
    try {
      const response = await axios.get(`http://3.38.176.179:4000/pdf`, {
        params: { pdfId },
      });
      const data = response.data;

      setGraphData(data);

      // PDF URL 추출
      const pdfUrl = data.url;
      if (pdfUrl) {
        // S3에서 PDF 파일 읽기
        const pdfResponse = await axios.get(pdfUrl, {
          responseType: 'blob',
        });
        const pdfFile = new File([pdfResponse.data], 'downloaded.pdf', {
          type: 'application/pdf',
        });
        setPdfFile(pdfFile);
      }
    } catch (error) {
      console.error('Error fetching PDF data:', error);
    }
  };

  const handleNodeClick = async (pageNumber: number) => {
    setTabs1((prevTabs) => {
      const newTabKey = `tab-${prevTabs.length}`; // prevTabs.length를 사용하여 새로운 탭 키 생성
      const newTabs = [...prevTabs, { key: newTabKey, title: `Page ${pageNumber}` }]; // 이전 탭 배열에 새 탭 추가
      setActiveTab1(newTabs.length - 1); // 새로 추가된 탭을 활성화
      setTabPageNumbers((prevTabPageNumbers) => ({
        ...prevTabPageNumbers,
        [newTabKey]: pageNumber,
      })); // 새 탭의 페이지 번호 설정
      return newTabs; // 새 탭 배열 반환
    });
  };

  const handleSessionNodeClick = async (sessionId: number) => {
    setTabs2((prevTabs) => {
      const newTabKey = `session-tab-${prevTabs.length}`; // prevTabs.length를 사용하여 새로운 탭 키 생성
      const newTabs = [...prevTabs, { key: newTabKey, title: `Session ${sessionId}` }]; // 이전 탭 배열에 새 탭 추가
      setActiveTab2(newTabs.length - 1); // 새로 추가된 탭을 활성화
      setTabSessionNumbers((prevTabSessionNumbers) => ({
        ...prevTabSessionNumbers,
        [newTabKey]: sessionId,
      })); // 새 탭의 세션 번호 설정
      return newTabs; // 새 탭 배열 반환
    });
  };

  const getCookieValue = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const handleBookmarkedButtonClick = async (chapterId: number) => {
    setIsBookmark((isBookmark + 1) % 2);
    try {
      const token = getCookieValue('token');
      const response = await axios.put(
        'http://3.38.176.179:4000/pdf/bookmark',
        {
          bookmarked: (selectedToc!.bookmarked + 1) % 2,
          chapterId: chapterId,
        },
        {
          headers: {
            token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6Iu2FjOyKpOydtCIsInVzZXJJZCI6InRlc3QyIiwidXVpZCI6MiwiaWF0IjoxNzI1MjYxMjExLCJleHAiOjE3OTcyNjEyMTF9.8P4sPDaHi6pikx6ArF17ejU-VBNbmFeONDAsnD15D90`,
          },
        },
      );
      fetchGraphData(selectedPdfId!);
    } catch (error) {
      console.error('백엔드 문제입니다. : ', error);
    }
  };

  // pdf 바뀔 때 초기화 로직
  useEffect(() => {
    if (selectedPdfId !== null) {
      fetchGraphData(selectedPdfId); // pdf파일 클릭시 선택된 pdfId 전달하고, url, nodes, links 가져오기
      // tab 초기화
      setTabs1([
        { key: 'diagram', title: 'Diagram' },
        { key: 'bookmarked', title: 'Bookmarked' },
      ]);
      setActiveTab1(0); // 다이어그램 활성화
      setOpenTabOrder([0, 1]); // 히스토리 업데이트
    }
  }, [selectedPdfId]);

  useEffect(() => {
    if (selectedToc) {
      addTab1(selectedToc.startPage); // 목차 클릭시 Tab 추가하고, 선택된 목차의 pageNumber pdfReader에 전달
    }
  }, [selectedToc]);

  useEffect(() => {
    setOpenTabOrder((prevOrder) => {
      const newOrder = [activeTab1, ...prevOrder.filter((index) => index !== activeTab1)];
      return newOrder;
    });
  }, [activeTab1]);

  return (
    <div ref={containerRef} className="relative h-full flex" style={{ userSelect: 'none' }}>
      <div style={{ width: `${leftWidth}%` }} className="h-full">
        <Tabs
          selectedIndex={activeTab1}
          onSelect={(tabIndex) => {
            setActiveTab1(tabIndex);
          }}
          className="flex flex-col flex-1 h-full w-full"
        >
          <TabList>
            {tabs1.map((tab, index) => (
              <Tab key={tab.key}>
                {tab.title}
                &nbsp;
                {index > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab1(tab.key, index);
                    }}
                  >
                    x
                  </button>
                )}
              </Tab>
            ))}
          </TabList>
          {tabs1.map((tab) => (
            <TabPanel key={tab.key}>
              <div className="pdf-reader-container w-full h-full overflow-hidden">
                {tab.key === 'diagram' || tab.key === 'bookmarked' ? (
                  <Graph
                    iskey={tab.key}
                    data={
                      graphData || {
                        nodes: [],
                        links: [],
                        session_nodes: [],
                        session_links: [],
                      }
                    }
                    handleNodeClick={handleNodeClick}
                    handleSessionNodeClick={handleSessionNodeClick}
                  />
                ) : (
                  <div className="relative tab-panel h-full w-full">
                    <button
                      className="absolute top-4 left-4 z-10 bg-white p-2 rounded shadow"
                      onClick={() => handleBookmarkedButtonClick(selectedToc!.id)}
                    >
                      {isBookmark ? '북마크 됨' : '북마크 안됨'}
                    </button>
                    <PDFReader pageNumber={tabPageNumbers[tab.key]} />
                  </div>
                )}
              </div>
            </TabPanel>
          ))}
        </Tabs>
      </div>
      <div className="w-2 cursor-col-resize" onMouseDown={handleMouseDown} />
      <div style={{ width: `${100 - leftWidth}%` }} className="h-full">
        <Tabs
          selectedIndex={activeTab2}
          onSelect={(tabIndex) => setActiveTab2(tabIndex)}
          className="flex flex-col flex-1 h-full"
        >
          <TabList>
            {tabs2.map((tab, index) => (
              <Tab key={tab.key}>
                {tab.title}
                &nbsp;
                {index !== 0 && <button onClick={() => removeTab2(tab.key)}>x</button>}
              </Tab>
            ))}
          </TabList>
          {tabs2.map((tab) => (
            <TabPanel key={tab.key}>
              {tab.key === 'chat' ? (
                <Chat sessionId={tabSessionNumbers[tab.key]} />
              ) : (
                <div className="relative tab-panel h-full">
                  <h3 className="absolute top-1 right-4 z-10">
                    Tab Number: {tabs2.findIndex((t) => t.key === tab.key)}
                  </h3>
                  <Chat sessionId={tabSessionNumbers[tab.key]} /> {/* 세션 ID 전달 */}
                </div>
              )}
            </TabPanel>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
