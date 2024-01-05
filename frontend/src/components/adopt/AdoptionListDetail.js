import React, { useEffect, useState } from 'react';
import './AdoptionListDetail.scss';
import { Button } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ADOPT, API_BASE_URL, CONTRACT } from '../../global/config/host-config';
import { WarningAlert, WarningAlert2 } from '../../global/Alerts';

const AdoptionListDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { desertionNo } = useParams();
  // const { wishNo } = useParams();

  const [adoptListDetail, setAdoptListDetail] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [wishNo, setWishNo] = useState(null);

  const userId = localStorage.getItem('USER_ID');
  const token = localStorage.getItem('ACCESS_TOKEN');
  const score = localStorage.getItem('SCORE');

  // const [profileImgStyle, setProfileImgStyle] = useState({
  //   position: 'relative',
  //   width: '250px',
  //   right: '-420px',
  //   top: '90px',
  // });

  // 입양 신청서 요청하기
  const goAdoptionApplication = async () => {
    try {
      // userId가 null이면 로그인되지 않은 상태이므로 오류를 출력하고 중단
      if (!userId) {
        WarningAlert2(
          '로그인 이후에 이용해 주세요',
          '',
          '로그인 되어 있지 않습니다.'
        );
        // console.error('사용자가 로그인되어 있지 않습니다.');
        // alert('사용자가 로그인되어 있지 않습니다.');
        // 로그인 페이지로 이동하거나 다른 처리를 수행
        return;
      } else if (!score || score < 6) {
        WarningAlert2(
          '반려 퀴즈 수료 이후에 이용해 주세요',
          '',
          '반려 퀴즈 먼저 수료 해 주세요.'
        );
        return;
      }

      const url = `${API_BASE_URL}${CONTRACT}/${userId}/${desertionNo}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const responseData = await response.json();
        setAdoptListDetail(responseData);

        // 서버 응답에서 wishNo를 추출하여 상태에 저장
        if (responseData && responseData.wishNo) {
          setWishNo(responseData.wishNo);
        }
        console.log('입양 신청서 요청이 성공했습니다.');
        navigate(`/contract/${userId}/${desertionNo}`, {
          state: { adoptListDetail: responseData },
        });
      } else {
        console.error('입양 신청서 요청이 실패했습니다.');
      }
    } catch (error) {
      console.error('입양 신청서 요청 중 오류 발생:', error);
    }
  };

  // 좋아요/좋아요 취소 버튼
  const handleLikeBtn = async () => {
    try {
      // userId가 null이면 로그인되지 않은 상태이므로 오류를 출력하고 중단
      if (!userId || !token) {
        WarningAlert(
          '로그인 이후에 이용해 주세요',
          '',
          '로그인되어 있지 않습니다.'
        );
        // console.error('사용자가 로그인되어 있지 않습니다.');
        // alert('사용자가 로그인되어 있지 않습니다.');
        // 로그인 페이지로 이동하거나 다른 처리를 수행
        return;
      }

      const url = isLiked
        ? `${API_BASE_URL}${ADOPT}/wish/${wishNo}` // 좋아요 취소
        : `${API_BASE_URL}${ADOPT}/wishregist/${desertionNo}`; // 좋아요

      const method = isLiked ? 'DELETE' : 'GET'; // 좋아요 상태에 따라 요청 방식 변경

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
        },
      });

      if (response.status === 200) {
        console.log(`관심 ${isLiked ? '취소' : '등록'} 요청이 성공했습니다.`);

        // 좋아요 취소의 경우 서버에서 응답이 없으므로 따로 처리할 데이터가 없음
        if (!isLiked) {
          const responseData = await response.json();
          console.log('서버 응답:', responseData);
          // responseData에서 wishNo를 추출하여 상태에 저장
          if (responseData && responseData.wishNo) {
            setWishNo(responseData.wishNo);
          }
        }

        setIsLiked(!isLiked); // 좋아요 상태 토글
      } else {
        console.error(`관심 ${isLiked ? '취소' : '등록'} 요청이 실패했습니다.`);

        // 서버 응답이 JSON이 아닌 경우에 대한 예외 처리
        try {
          const errorData = await response.json();
          console.error('서버 오류:', errorData);
        } catch (error) {
          console.error('서버 응답이 JSON이 아닙니다.');
        }
      }
    } catch (error) {
      console.error(
        `관심 ${isLiked ? '취소' : '등록'} 요청 중 오류 발생:`,
        error
      );
    }
  };

  useEffect(() => {
    const { state } = location;
    setAdoptListDetail(state ? state.adoptListDetail : null);
  }, [location]);

  const { state } = location;
  //const desertionNo = state ? state.desertionNo : null;

  return (
    <div className='main'>
      <div className='border'>
        <div className='dog-profileimg'>
          <img
            src={adoptListDetail?.profileImg}
            alt='profile'
          />
        </div>

        {/* 관심등록 버튼 */}
        <div className='likebtn'>
          <img
            onClick={handleLikeBtn}
            src={
              isLiked
                ? '/img/dogPic/likeBtnAfter.png'
                : '/img/dogPic/likeBtnBefore.png'
            }
            alt='likebtn'
          />
          <button> {isLiked ? '관심 취소' : '관심 등록'}</button>
        </div>

        <div className='dog-info'>
          <div className='dog-info1'>
            <p> 입양번호: {adoptListDetail?.desertionNo}</p>
            <p> 접수일: {adoptListDetail?.noticeSdt}</p>
            <p> 공고기간: {adoptListDetail?.noticeEdt}</p>
            <p> 발견장소: {adoptListDetail?.happenAddr} </p>
            <p> 나이: {adoptListDetail?.age}</p>
            <p> 견종: {adoptListDetail?.kindCd}</p>
            <p> 색상: {adoptListDetail?.colorCd}</p>
            <p> 무게: {adoptListDetail?.weight}</p>
            <p> 성별: {adoptListDetail?.gender === 'M' ? '수컷' : '암컷'}</p>
            <p> 중성화 여부: {adoptListDetail?.neuterYn === 'Y' ? '0' : 'x'}</p>
            <p> 특이사항: {adoptListDetail?.specialMark}</p>
            <p> 보호소 이름: {adoptListDetail?.careNm}</p>
            <p> 보호소 전화번호: {adoptListDetail?.careTel}</p>
            <p>
              {' '}
              보호장소 <br /> :{adoptListDetail?.careAddr}
            </p>
            <p> 관할기관: {adoptListDetail?.orgNm}</p>
            <p> 담당자: {adoptListDetail?.chargeNm}</p>
            <p> 담당자 연락처: {adoptListDetail?.officeTel}</p>
          </div>

          <div className='dog-info2'></div>
          <div className='adopt-button'>
            <Button
              variant='outlined'
              onClick={goAdoptionApplication}
            >
              입양신청서
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdoptionListDetail;
