import React, { useContext, useEffect, useState } from 'react';
import './Header.scss';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../../global/utils/AuthContext';
import {
  API_BASE_URL,
  USER,
  ADOPT,
  BOARD,
  PRODUCT,
  KNOWLEDGES,
} from '../../global/config/host-config';

const Header = () => {
  const location = useLocation();
  const [isNotFoundPage, setIsNotFoundPage] = useState(false);

  const redirection = useNavigate();
  const toLink = (loc) => {
    redirection(loc);
  };

  useEffect(() => {
    // 페이지 경로가 '/pagenotfound'이면 isNotFoundPage를 true로 설정
    setIsNotFoundPage(location.pathname === '/pagenotfound');
  }, [location.pathname]);

  const { isLoggedIn, onLogout, isAdmin } = useContext(AuthContext);

  // 로그아웃 핸들러
  const logoutHandler = async () => {
    const res = await fetch(`${API_BASE_URL}${USER}/logout`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
      },
    });

    onLogout();
    redirection('/');
  };

  // 로그인 상태가 바뀔때마다
  useEffect(() => {
    console.log('상태변경', isLoggedIn);
  }, [isLoggedIn]); // 로그인 상태가 바뀔때마다

  return (
    !isNotFoundPage && (
      <>
        <div className='HeaderContainer1'>
          <ul>
            {isLoggedIn ? (
              <>
                <li onClick={() => toLink(`${USER}/mypage`)}>마이페이지</li>
                <li onClick={logoutHandler}>로그아웃</li>
                {isAdmin && (
                  <li
                    className='admin'
                    onClick={() => toLink('/adminmain')}
                  >
                    관리자메인
                  </li>
                )}
              </>
            ) : (
              <>
                <li onClick={() => toLink(`${USER}/login`)}>로그인</li>
                <li onClick={() => toLink(`${USER}/join`)}>회원가입</li>
              </>
            )}
          </ul>
        </div>
        <div className='Dogether'>
          <Link to={'/'}>
            <div>Dogether</div>
          </Link>
        </div>
        <div className='HeaderContainer2'>
          <ul>
            <li>
              <p onClick={() => toLink(`${ADOPT}`)}>입양 게시판</p>
            </li>
            <li>
              <p onClick={() => toLink(`${BOARD}`)}>자유 게시판</p>
            </li>
            <li>
              <p onClick={() => toLink(`${PRODUCT}`)}>판매 상품</p>
            </li>
            <li>
              <p onClick={() => toLink(`${KNOWLEDGES}/knowledge`)}>반려 백과</p>
            </li>
            <li>
              <p onClick={() => toLink(`${KNOWLEDGES}/quiz`)}>반려 퀴즈</p>
            </li>
          </ul>
        </div>
        <div className='HeaderContainer3'></div>
      </>
    )
  );
};

export default Header;
