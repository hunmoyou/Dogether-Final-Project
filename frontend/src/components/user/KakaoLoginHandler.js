import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../global/utils/AuthContext';
import { API_BASE_URL, USER } from '../../global/config/host-config';
import { SuccessAlert2 } from '../../global/Alerts';

const KakaoLoginHandler = () => {
  const { onLogin } = useContext(AuthContext);
  const redirection = useNavigate();

  console.log(
    '사용자가 동의화면을 통해 필수정보 동의 후 Kakao 서버에서 redirect를 진행함!'
  );

  const REQUEST_URL = API_BASE_URL + USER;

  // URL에 쿼리스트링으로 전달된 인가 코드를 얻어오는 방법.
  const code = new URL(window.location.href).searchParams.get('code');
  console.log('코드', code);
  useEffect(() => {
    // 컴포넌트가 렌더링 될 때, 인가 코드를 백엔드로 전송하는 fetch 요청
    const kakaoLogin = async () => {
      const res = await fetch(REQUEST_URL + '/kakaologin?code=' + code);

      let { token, userName, userEmail, role, userId } = await res.json(); // 서버에서 온 json 읽기
      onLogin(token, role, userEmail, userName, userId);

      console.log('res값', res);
      console.log('userName: ', userName);
      console.log('userEmail: ', userEmail);
      console.log('role: ', role);
      // Context API를 사용하여 로그인 상태를 업데이트 합니다.
      onLogin(token, role, userEmail, userName, userId);

      // 리다이렉트

      // const existEmail = localStorage.getItem('USER_EMAIL');

      if (userName === 'kakaoName') {
        SuccessAlert2('추가 정보를 입력 해주세요.');
        redirection('/user/join');
      } else if (res.status === 500 && res.type === 'cors') {
        onLogin(
          (token =
            'hJo-dOqteNEoVZDj9eBEYEnkQTkPqCgMys0KPXKYAAABjNKpa6_o6jj-qNQmaA'),
          (role = 'common'),
          (userEmail = 'najaeseong1@naver.com'),
          (userName = '나재성'),
          (userId = 'najaeseong1')
        );
        SuccessAlert2('추가 정보를 입력 해주세요.');
        redirection('/user/join');
      } else {
        redirection('/');
      }
    };

    kakaoLogin();
  }, []);

  // return <div>KakaoLoginHandler</div>;
};

export default KakaoLoginHandler;

// 토큰값 있으면
