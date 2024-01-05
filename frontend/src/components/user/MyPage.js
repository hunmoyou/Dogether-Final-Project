import React, { useEffect, useState, useContext } from 'react';
import './MyPage.scss';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL, BOARD, USER } from '../../global/config/host-config';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../global/utils/AuthContext';

const MyPage = () => {
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState([]);

  const userId = localStorage.getItem('USER_ID');
  // 점수 70 점 이상이면 수료 /
  //const score = 75;
  const [score, setScore] = useState('');

  useEffect(() => {
    // 점수 가져오기
    axios
      .get(`${API_BASE_URL}${USER}/knowledges/quiz`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
        },
      })
      .then((res) => {
        console.log(res);
        setScore(res.data.score);
      })
      .catch((err) => {
        console.log(err);
      });

    //글 목록 가져오기

    axios
      .get(`${API_BASE_URL}${BOARD}/myboardlist/${userId}`)
      .then((res) => {
        if (res.data && res.data.boards && Array.isArray(res.data.boards)) {
          setUserPosts(res.data.boards);
        } else {
          setUserPosts([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
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

  // 점수에 따라 수료 여부 결정
  const completionStatus = score >= 70 ? '수료' : '미수료';
  const showLink = score < 70;

  return (
    <div className='mypage-fixed'>
      <div className='group-wrapper'>
        <div className='group'>
          <button className='mypage-tap'>
            <Link to='/user/mypage'>마이페이지</Link>
          </button>
          <button className='modify-tap'>
            <Link to='/user/modify'>개인정보변경</Link>
          </button>
          <button className='adoptionstatus'>
            <Link to='/user/adoptionstatus'>입양신청현황</Link>
          </button>
          <button className='like-list-tap'>
            <Link to='/user/likelist'>좋아요목록</Link>
          </button>
          <button className='order-history'>
            <Link to='/user/orderhistory'>주문 현황</Link>
          </button>
          <Link to='/knowledges/knowledge'>
            <div className='know-group'>
              <p className='knowledge'>지식백과</p>
              <p className='knowledgecon'>바로가기</p>
            </div>
          </Link>
          <div className='completion-group'>
            <p className='completion'>수료여부</p>
            <p className='completion-status'>{completionStatus}</p>
          </div>
          {showLink ? (
            // 미수료 상태일 때 퀴즈 바로가기 링크 표시
            <Link to='/knowledges/quiz'>
              <div className='quiz-group'>
                <p className='quiz'>반려퀴즈</p>
                <p className='toquiz'>바로가기</p>
              </div>
            </Link>
          ) : (
            // 수료 상태일 때 퀴즈 점수 표시
            <div className='quiz-group'>
              <p className='quiz'>퀴즈점수</p>
              <p className='quiz-score'>{score}점</p>
            </div>
          )}

          <div className='board'>게시판</div>
          <div
            className='board-list'
            style={{ display: userPosts.length > 0 ? 'flex' : 'none' }}
          >
            <div className='category'>카테고리</div>
            <div className='text'>제목</div>
            <div className='date'>작성일</div>
          </div>
          {Array.isArray(userPosts) && userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div
                className='board-content'
                onClick={() => boardDetailHandler(post.boardNo)}
                key={post.boardNo}
              >
                <div className='category'>{post.category}</div>
                <div className='text'>{post.title}</div>
                <div className='date'>{post.registDate}</div>
              </div>
            ))
          ) : (
            <div className='board-content-not'>등록한 게시글이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
