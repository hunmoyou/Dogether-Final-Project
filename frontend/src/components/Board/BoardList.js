import React, { useEffect, useState } from 'react';
import './BoardList.scss';
import { Link, useNavigate } from 'react-router-dom';

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { API_BASE_URL, BOARD } from '../../global/config/host-config';
import { WarningAlert2 } from '../../global/Alerts';
const itemsPerPage = 10; // 페이지당 보여줄 항목 수
const BOARDLIST_URL = `${API_BASE_URL}${BOARD}`;

// const API_URL = `${API_BASE_URL}${BOARD}/detail/`;
const BoardList = () => {
  const navigate = useNavigate();
  const redirection = useNavigate(); //페이지 전환 위해 쓴거
  const [currentPage, setCurrentPage] = useState(1); //사용자 첫 페이지 설정
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 담을 useState
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [boardData, setBoardData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(BOARDLIST_URL);
        const data = await response.json();
        console.log(data.boards);
        setBoardData(data.boards);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
    console.log('유저 아이디', userId);
  }, []);
  const userId = localStorage.getItem('USER_ID');

  const BoardRegist = () => {
    if (!userId) {
      WarningAlert2(
        '로그인 이후에 이용해 주세요',
        '',
        '로그인되어 있지 않습니다.'
      );

      return;
    }

    redirection('/boardRegist');
  };

  //게시판 상세보기 요청
  const boardDetailHandler = (boardNo) => {
    const token = localStorage.getItem('ACCESS_TOKEN');

    fetch(`${API_BASE_URL}${BOARD}/detail/${boardNo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        navigate(`${BOARD}/detail/${boardNo}`, {
          state: { boarddetail: data },
        });
        console.log('상세 페이지 데이터:', data);
      })
      .catch((error) => {
        console.error('상세 페이지로 이동 중 에러 발생:', error);
      });
  };

  const filterBySearchTerm = (post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase());

  const filterByCategory = (post) =>
    selectedCategory === 'all' || post.category === selectedCategory;

  const filteredData =
    boardData.length > 0
      ? boardData.filter(filterByCategory).filter(filterBySearchTerm)
      : [];

  const totalButtonCount = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // const boardDetailHandler = (boardNo) => {
  //   redirection(`/boardDetail/${boardNo}`);
  // };

  //mui에서 현재 기본 정보를 담고 있는 event 객체를 원함 그래서 인자 두개
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // 테이블에서 글 번호를 계산하는 함수
  const calculateRowNumber = (index) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.length - (startIndex + index);
  };

  return (
    <div className='BoardListTemplate1'>
      <div className='boardTitile'>자유게시판</div>
      <div className='searchText'>
        <select
          id='boardListCategory'
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value='all'>전체 카테고리</option>
          <option value='후기'>후기게시판</option>
          <option value='자유'>자유게시판</option>
        </select>
        <input
          type='text'
          placeholder='검색어를 입력하세요.'
          id='searchboard'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>글번호</th>
            <th>분류</th>
            <th>제목</th>
            <th>작성일</th>
            <th>글쓴이</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.reverse().map((post, index) => (
            <tr
              key={post.boardNo}
              onClick={() => boardDetailHandler(post.boardNo)}
            >
              <td>{calculateRowNumber(index)}</td>
              <td>{post.category}</td>
              <td>{post.title}</td>
              <td>{post.registDate}</td>
              <td>{post.userId}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='pagination-container'>
        <Stack spacing={2}>
          <Pagination
            count={totalButtonCount}
            page={currentPage}
            onChange={handlePageChange}
            variant='outlined'
          />
        </Stack>
      </div>
      <div className='listButtonDiv'>
        <button
          className='listButton'
          onClick={BoardRegist}
        >
          글쓰기
        </button>
      </div>
    </div>
  );
};

export default BoardList;
