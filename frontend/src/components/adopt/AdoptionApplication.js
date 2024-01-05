import { Button, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import './AdoptionApplication.scss';
import axios from 'axios';
import { error } from 'jquery';
import { json, useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL, CONTRACT } from '../../global/config/host-config';
import Swal from 'sweetalert2';
import { WarningAlert } from '../../global/Alerts';

const AdoptionApplication = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { desertionNo } = useParams();

  const score = localStorage.getItem('SCORE');

  const [modalVisible, setModalVisible] = useState(true);
  const [registData, setRegistData] = useState({
    job: '',
    petStatus: false,
    reason: '',
  });
  const handleImageClick = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    // 페이지 로딩 후 2초 뒤에 모달 창 숨김
    const timer = setTimeout(() => {
      setModalVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []); // 빈 배열은 컴포넌트가 처음 마운트될 때만 실행

  const [formData, setFormData] = useState({
    userName: '',
    postAddr: '',
    userPhone: '',
    userEmail: '',
    desertionNo: desertionNo,
    careNm: '',
    age: '',
    gender: '',
    kindCd: '',
    weight: '',
    happenAddr: '',
    specialMark: '',
    neuterYn: '',
    reasonRefusal: '',
    colorCd: '',
  });

  useEffect(() => {
    const { state } = location;
    setFormData(state ? state.adoptListDetail : {});
  }, [location]);

  const handleInputChange = (event) => {
    const { id, value } = event.target;

    if (id === 'userAge' && parseInt(value, 10) > 150) {
      Swal.fire('올바른 나이를 입력해주세요.', '', 'error');
      return;
    }
    if (id === 'job' && value.trim() !== '' && !isNaN(value)) {
      Swal.fire('올바른 직업을 입력해주세요.', '', 'error');
      return;
    }

    console.log('id,value', id, value);
    // 펫 여부확인 버튼(radio)가 true면 petStatus를 true로 만듬
    // 서버 type 설정이 그렇게 되어 있어서 맞춰준거임
    if (id === 'petStatusFalse' || id === 'petStatusTrue') {
      setRegistData((prevData) => ({
        ...prevData,
        petStatus: value === 'true' ? true : false,
      }));
    } else {
      setRegistData((prevData) => ({
        ...prevData,
        [id]: value,
        job: id === 'job' ? value : prevData.job,
        reason: id === 'reason' ? value : prevData.reason,
      }));
    }
  };
  console.log('새로운 폼데이터 정보', registData.job);
  console.log('폼데이터 정보', formData);

  const handleSummit = async (e) => {
    // eslint-disable-next-line no-mixed-operators
    if (
      score === undefined ||
      score === null ||
      parseInt(score) <= 6 ||
      parseInt(score) === 0
    ) {
      e.preventDefault();
      WarningAlert(
        '반려퀴즈 70점 이상 신청 가능합니다.',
        '',
        '반려 퀴즈 미수료 상태입니다.'
      );
      return;
    }

    if (registData.job.trim() === '' && registData.reason.trim() === '') {
      Swal.fire('입력값이 비었습니다.', '', 'error');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}${CONTRACT}/regist`,
        {
          desertionNo: desertionNo,
          userName: formData.userName,
          userAge: registData.userAge,
          petStatus: formData.petStatus,
          job: registData.job,
          userEmail: formData.userEmail,
          userPhone: formData.userPhone,
          postAddr: formData.postAddr,
          reason: registData.reason,
        },
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
          },
        }
      );
      console.log('응답:', response.data);
      Swal.fire('입양 신청이 완료되었습니다.', '', 'success');
      navigate('/');
    } catch (error) {
      // 에러 처리
      if (error.response) {
        const statusCode = error.response.status;
        console.log('999의 값', statusCode);
        if (statusCode === 500) {
          Swal.fire('중복된 신청입니다.', '', 'error');
        }
      }
      // Swal.fire('입력값이 비었습니다.', '', 'error');
    }
  };

  return (
    <div className='main2'>
      {/* 모달 오버레이 */}
      {modalVisible && (
        <div
          className={'modal-overlayy'}
          onClick={handleImageClick}
        >
          {/* 모달 콘텐츠 */}
          <div className='modal-contentt'>
            <img
              onClick={handleImageClick}
              className='modal-image'
              src='/img/dogPic/caution.png'
              alt='Dog Profile'
            />
          </div>
        </div>
      )}

      <div className='userinfo'>입양신청서 기본정보</div>

      <div className='name'>
        이름&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type='text'
          id='userName'
          className='userName'
          value={formData.userName}
          readOnly
        />
      </div>

      <div className='age'>
        나이&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type='number'
          id='userAge'
          className='userAge'
          onChange={handleInputChange}
          placeholder='숫자만 입력해 주세요'
        />
      </div>

      <div className='addrr'>
        주소&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type='text'
          id='postAddr'
          className='postAddr'
          value={formData.postAddr}
          readOnly
        />
      </div>

      <div className='yeobu'>
        반려동물 여부: &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            type='radio'
            id='petStatusTrue'
            name='petStatus'
            className='petStatus'
            value='true'
            onChange={handleInputChange}
          />
          Yes
        </label>
        <label>
          <input
            type='radio'
            id='petStatusFalse'
            name='petStatus'
            className='petStatus'
            value='false'
            onChange={handleInputChange}
            checked
          />
          No
        </label>
      </div>

      <div className='job1'>
        직업&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type='text'
          id='job'
          className='job'
          onChange={handleInputChange}
          placeholder='직업을 입력해 주세요'
        />
      </div>

      <div className='email'>
        이메일&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type='email'
          id='userEmail'
          className='userEmail'
          value={formData.userEmail}
          readOnly
        />
      </div>

      <div className='tel'>
        전화번호 &nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type='tel'
          id='userPhone'
          value={formData.userPhone}
          readOnly
        />
      </div>

      <div className='reason1'>
        입양사유&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type='text'
          id='reason'
          className='reason'
          onChange={handleInputChange}
          placeholder='입양 사유를 입력해 주세요'
        />
      </div>

      <div className='doginfo'>유기견 기본정보</div>

      <div className='carenm'>
        보호소 이름 &nbsp;&nbsp;&nbsp;
        <input
          type='text'
          id='carenm'
          value={formData.careNm}
          readOnly
        />
      </div>

      <div className='age2'>
        나이 &nbsp;&nbsp;&nbsp;
        <input
          type='text'
          id='age2'
          value={formData.age}
          readOnly
        />
      </div>

      <div className='gender'>
        성별 &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;
        <input
          type='text'
          id='gender'
          value={formData.gender === 'M' ? '수컷' : '암컷'}
          readOnly
        />
      </div>

      <div className='kind'>
        품종 &nbsp;&nbsp;&nbsp;
        <input
          type='text'
          id='gender'
          value={formData.kindCd}
          readOnly
        />
      </div>

      <div className='happenplace'>
        발견장소 &nbsp;&nbsp;&nbsp;
        <input
          type='text'
          id='happenplace'
          value={formData.happenAddr}
          readOnly
        />
      </div>

      <div className='specialmark'>
        특이사항 &nbsp;&nbsp;&nbsp;
        <input
          type='textarea'
          id='special'
          value={formData.specialMark}
          readOnly
        />
      </div>

      <div className='yeobu2'>
        중성화 여부 &nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type='text'
          id='neuterYn'
          value={formData.neuterYn === 'Y' ? 'O' : 'X'}
          readOnly
        />
      </div>

      <div className='checkbutton'>
        <button onClick={handleSummit}>확인</button>
      </div>
    </div>
  );
};

export default AdoptionApplication;
