import React, { useRef, useState } from 'react';
import './Board.scss'; // SCSS 파일 import
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, BOARD } from '../../global/config/host-config';
import Swal from 'sweetalert2';
import { WarningAlert2 } from '../../global/Alerts';

const API_URL = `${API_BASE_URL}${BOARD}/regist`;

const Board = () => {
  const redirection = useNavigate();

  const $fileTag = useRef();
  const [imagePreview, setImagePreview] = useState(null); //이미지 프리뷰임

  // 상태 관리를 위한 useState
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    // 비동기 함수로 변경
    e.preventDefault();
    if (title.length === 0) {
      Swal.fire('제목을 입력해 주시기 바랍니다', '', 'warning');
      return;
    }

    if (content.length === 0) {
      Swal.fire('내용을 입력해 주시기 바랍니다', '', 'warning');
      return;
    }

    if (!category) {
      Swal.fire('카테고리를 선택해 주시기 바랍니다', '', 'warning');
      return;
    }

    boardRegist(title, content, category, file);
  };

  const boardRegist = async (title, content, category, file) => {
    const formData = new FormData();

    // JSON 데이터 추가
    const jsonData = {
      title: title,
      content: content,
      category: category,
    };

    formData.append(
      'board',
      new Blob([JSON.stringify(jsonData)], { type: 'application/json' })
    );

    // 이미지 파일 추가
    console.log('등록쪽에 파일 추가?/', $fileTag.current.files[0]);
    if (file) {
      formData.append('ImageFile', $fileTag.current.files[0]);
      console.log('file', file);
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
        },
      });

      if (!response.ok) {
        // 서버 응답이 오류일때
        console.error('Server error:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.error('Server error data:', errorData);
          Swal.fire('로그인 후 이용해주시길 바랍니다.', '', 'warning');
        } catch (error) {
          console.error('Failed to parse error response:', error);
          Swal.fire('로그인 후 이용해주시길 바랍니다.', '', 'warning');
        }
        return;
      }

      // 성공적으로 등록된 경우의 처리
      Swal.fire('게시판 글이 등록되었습니다.', '', 'success');
      redirection('/board');
    } catch (error) {
      // 네트워크 오류 등의 문제 발생 시 처리
      console.error('Error during data submission:', error);
      alert('데이터 전송 중 오류가 발생했습니다.');
    } finally {
      setTitle('');
      setContent('');
      setFile(null);
      setCategory('');
    }
  };

  //타이틀 핸들러
  const boardTitleHandler = (e) => {
    e.preventDefault();
    setTitle(e.target.value);
    console.log(title);
  };

  //컨텐트 핸들러
  const boardContentHandler = (e) => {
    e.preventDefault();
    setContent(e.target.value);
    console.log(content);
  };

  const boardCategoryHandler = (e) => {
    e.preventDefault();
    setCategory(e.target.value);
    console.log(category);
  };

  // 파일 선택 시 처리 함수
  const handleFileChange = (e) => {
    // 선택한 파일을 상태에 저장
    const file = $fileTag.current.files[0];
    console.log('$file', $fileTag.current.files[0]);

    //확장자 얻기
    const fileExt = file.name.slice(file.name.indexOf('.') + 1).toLowerCase();

    if (
      fileExt !== 'jpg' &&
      fileExt !== 'png' &&
      fileExt !== 'jpeg' &&
      fileExt !== 'gif'
    ) {
      WarningAlert2('이미지 파일 (jpg, png, jpeg, gif)만 등록 가능합니다.');
      $fileTag.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFile(reader.result);
      setImagePreview(reader.result); // 이미지 미리보기
      console.log('image', imagePreview);
    };
  };
  const boardListHandler = () => {
    Swal.fire({
      title: '글 작성을 취소하시겠습니까?',
      text: '변경사항이 저장되지 않습니다',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
    }).then((result) => {
      if (result.isConfirmed) {
        redirection('/board');
      }
    });
  };

  return (
    <div className='board-container'>
      <div className='boardTitle'>게시물 작성</div>
      <form onSubmit={handleSubmit}>
        <label>
          제목
          <input
            type='text'
            value={title}
            onChange={boardTitleHandler}
          />
        </label>

        <label>
          카테고리
          <select
            value={category}
            onChange={boardCategoryHandler}
          >
            <option value=''>카테고리 선택</option>
            <option value='후기'>후기 게시판</option>
            <option value='자유'>자유 게시판</option>
          </select>
        </label>
        <label
          for='file'
          className='fileLabel'
        >
          파일 첨부
          <input
            type='file'
            id='file'
            onChange={handleFileChange}
            ref={$fileTag}
            hidden
          />
        </label>

        {/* 사용자 이미지 첨부시 보여질 이미지 */}
        {imagePreview && (
          <div className='image-preview'>
            <img
              src={imagePreview}
              alt='이미지 미리보기'
              style={{ width: '580px', height: '430px' }}
            />
          </div>
        )}
        <label>
          내용
          <textarea
            value={content}
            onChange={boardContentHandler}
          />
        </label>

        <div className='buttoncn'>
          <button
            type='submit'
            className='boardButton'
          >
            작성하기
          </button>
          <button
            type='button'
            className='boardButton'
            onClick={() => boardListHandler()}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default Board;
