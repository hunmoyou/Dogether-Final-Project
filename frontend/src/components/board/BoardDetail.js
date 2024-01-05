import React, { useRef, useEffect, useState } from 'react';
import './BoardDetail.scss';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL, BOARD } from '../../global/config/host-config';
import Swal from 'sweetalert2';
import { WarningAlert2 } from '../../global/Alerts';

let today = new Date();
const BoardDetail = () => {
  const $fileTag = useRef();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]); // 댓글 목록을 저장하는 상태, 배열로 아이디 내용을 담을 거임
  const [newComment, setNewComment] = useState(''); // 새로 작성 중인 댓글
  const redirection = useNavigate();
  const [boardDetail, setBoardDetail] = useState(null);
  const { boardNo } = useParams();
  const location = useLocation();
  const [image, setImage] = useState(null);
  const ReplyRegist_URL = `${API_BASE_URL}${BOARD}/reply`;
  const API_URL = `${API_BASE_URL}${BOARD}/${boardNo}`;
  const MODIFY_URL = `${API_BASE_URL}${BOARD}/${boardNo}`;
  const imageRequestURL = `${API_BASE_URL}${BOARD}/load-profile/${boardNo}`;
  const ReplyList_URL = `${API_BASE_URL}${BOARD}/replylist/${boardNo}`;
  const ReplyDelete_URL = `${API_BASE_URL}${BOARD}/reply`;
  const ReplyUpdate_URL = `${API_BASE_URL}${BOARD}/replymodify`;
  // 댓글 수정 상태 관리
  const [editingComment, setEditingComment] = useState(null);
  const toLink = (loc) => {
    redirection(loc);
  };

  useEffect(() => {
    const fetchImage = async () => {
      const res = await fetch(imageRequestURL, {
        method: 'GET',
      });
      console.log(res);

      if (res.status === 200) {
        const imageBlob = await res.blob();
        const img = window.URL.createObjectURL(imageBlob);

        console.log(img);
        setImage(img);
        console.log('이미지는?', image);
      } else {
        const err = await res.text();
      }
    };
    const { state } = location;
    setBoardDetail(state ? state.boarddetail : null);
    fetchImage();
    replyList();
  }, [location]);

  // 가상의 로그인 상태를 나타내는 함수
  const getLoggedInUserId = () => {
    //여기서 토큰 안에 있는 사용자 id 가져오면 될듯??
    return '로그인된사용자';
  };
  const requestHeader = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
  };

  // 댓글 등록 핸들러
  const handleCommentSubmit = () => {
    if (!currentUserId) {
      WarningAlert2(
        '로그인 이후에 이용해 주세요',
        '',
        '로그인되어 있지 않습니다.'
      );

      return;
    }
    if (newComment === '') {
      Swal.fire('댓글을 입력해주세요', '', 'error');
      return;
    }

    console.log(boardNo, newComment);
    fetch(ReplyRegist_URL, {
      method: 'POST',
      headers: requestHeader,
      body: JSON.stringify({
        boardNo: boardNo,
        replyContent: newComment,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        console.log(json.replyContent);
        const addComment = {
          content: json.replyContent,
          userId: json.userId,
          regDate: json.registDate,
        };
        setComments(json.replyLists);
        // 입력 폼 초기화
        setNewComment('');
      })
      .catch((error) => {
        console.error('Error during comment submission:', error);
      });
  };

  //댓글 목록 불러오기 요청
  const replyList = async () => {
    try {
      const response = await fetch(ReplyList_URL);
      const data = await response.json();
      console.log(data.replyLists);
      setComments(data.replyLists);
    } catch (error) {
      console.error(error);
    }
  };

  //댓글 삭제 요청

  const replyDeleteHandler = async (replyNo) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      console.log(`${ReplyDelete_URL}/${boardNo}/${replyNo}`);
      const res = await fetch(`${ReplyDelete_URL}/${boardNo}/${replyNo}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
        },
      })
        .then((res) => res.json())
        .then((json) => {
          setComments(json.replyLists);
        });
    }
  };

  //댓글 수정 요청
  // 수정 중인 댓글의 내용을 변경하는 핸들러
  const handleEditChange = (e, comment) => {
    const updatedComments = comments.map((c) =>
      c.replyNo === comment.replyNo ? { ...c, replyContent: e.target.value } : c
    );

    setComments(updatedComments);
  };

  // 수정 완료 버튼을 누르면 호출되는 핸들러
  const handleEditSubmit = async (comment) => {
    if (comment.replyContent === '') {
      Swal.fire('1자 이상 입력해주세요.', '', 'error');
      return;
    }
    console.log(ReplyUpdate_URL);
    console.log('값', boardNo, comment.replyContent, comment.replyNo);
    try {
      const response = await fetch(ReplyUpdate_URL, {
        method: 'PUT',
        headers: requestHeader,
        body: JSON.stringify({
          replyNo: comment.replyNo,
          replyContent: comment.replyContent,
          boardNo: boardNo,
        }),
      });

      if (response.status === 400) {
        alert('수정 권한이 없습니다.');
      }

      // 수정 완료 후 서버에서 댓글 목록을 다시 받아와서 UI 업데이트
      const updatedComments = await response.json();
      console.log(updatedComments);
      setComments(updatedComments.replyLists);

      // 수정 완료 후 editingComment 초기화
      setEditingComment(null);
    } catch (error) {
      console.error('Error during comment update:', error);
    }
  };
  //게시물 삭제 요청
  const deleteBoard = async () => {
    Swal.fire({
      title: '게시글을 삭제하시겠습니까?',
      showDenyButton: true,
      confirmButtonText: '예',
      denyButtonText: '아니오',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(MODIFY_URL, {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
          },
        });

        if (res.status === 200) {
          Swal.fire('게시물이 삭제되었습니다.', '', 'success');
          redirection('/board');
        } else {
          Swal.fire('삭제 권한이 없습니다.', '', 'warning');
        }
      }
    });
  };

  //게시물 수정 요청 베이스 끌고오기
  const modifyHandler = (boardNo) => {
    const token = localStorage.getItem('ACCESS_TOKEN');

    fetch(`${API_BASE_URL}${BOARD}/detail/${boardNo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        navigate(`/boardupdate/${boardNo}`, {
          state: { boardupdate: data },
        });
        console.log('상세 페이지 데이터:', data);
      })
      .catch((error) => {
        console.error('상세 페이지로 이동 중 에러 발생:', error);
      });
  };
  const currentUserId = localStorage.getItem('USER_ID');
  return (
    <div className='post-detail'>
      <h2>{boardDetail?.title}</h2>
      <p className='post-date'>
        작성자:{boardDetail?.userId} | 작성일: {boardDetail?.registDate}
      </p>
      {image && (
        <div className='post-content'>
          <img
            src={image}
            alt='게시물 이미지'
          />
        </div>
      )}
      <p>{boardDetail?.content}</p>

      {currentUserId === boardDetail?.userId && (
        <>
          <button
            onClick={deleteBoard}
            className='detail-btn'
          >
            삭제
          </button>
          <button
            onClick={() => modifyHandler(boardDetail.boardNo)}
            className='detail-btn'
          >
            수정
          </button>
        </>
      )}
      <div className='comment-section'>
        <ul>
          <h3>댓글 {comments.length}</h3>
          {comments.map((comment, index) => (
            <li key={index}>
              {editingComment === comment.replyNo ? (
                <div>
                  <p>{comment.userId}</p>
                  <input
                    type='text'
                    value={comment.replyContent}
                    onChange={(e) => handleEditChange(e, comment)}
                    id='modifyInput'
                  />
                  <button
                    className='modifybutton'
                    onClick={() => handleEditSubmit(comment)}
                  >
                    수정 완료
                  </button>
                </div>
              ) : (
                <>
                  <strong>{comment.userId}</strong>: {comment.replyContent}
                  <p className='replyRegDate'>
                    {comment.registDate}&nbsp;
                    <span
                      className='replybutton'
                      onClick={() => replyDeleteHandler(comment.replyNo)}
                    >
                      {comment.userId === currentUserId && <>삭제&nbsp;</>}
                    </span>
                    &nbsp;
                    <span
                      className='replybutton'
                      onClick={() => setEditingComment(comment.replyNo)}
                    >
                      {comment.userId === currentUserId && <>수정&nbsp;</>}
                    </span>
                  </p>
                </>
              )}
            </li>
          ))}
        </ul>
        <div className='comment-form'>
          <textarea
            placeholder='댓글을 입력하세요...'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            id='replycomment'
            onClick={handleCommentSubmit}
          >
            댓글 작성
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardDetail;
