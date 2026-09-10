// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log('웹사이트가 성공적으로 로드되었습니다.');

    const exploreBtn = document.getElementById('exploreBtn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ==========================================================================
    // 모바일 햄버거 메뉴 및 네비게이션 드로어 제어
    // ==========================================================================
    const navToggle = document.getElementById('navToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    const closeMobileMenu = () => {
        if (navToggle && mobileDrawer) {
            navToggle.classList.remove('is-active');
            navToggle.setAttribute('aria-expanded', 'false');
            mobileDrawer.classList.remove('is-active');
            mobileDrawer.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('menu-open');
        }
    };

    const openMobileMenu = () => {
        if (navToggle && mobileDrawer) {
            navToggle.classList.add('is-active');
            navToggle.setAttribute('aria-expanded', 'true');
            mobileDrawer.classList.add('is-active');
            mobileDrawer.setAttribute('aria-hidden', 'false');
            document.body.classList.add('menu-open');
        }
    };

    if (navToggle && mobileDrawer) {
        navToggle.addEventListener('click', () => {
            const isOpen = mobileDrawer.classList.contains('is-active');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        if (drawerBackdrop) {
            drawerBackdrop.addEventListener('click', closeMobileMenu);
        }

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && mobileDrawer.classList.contains('is-active')) {
                closeMobileMenu();
            }
        });
    }

    // BEER 페이지 맥주 카드 카테고리 필터링
    const beerFilterBtns = document.querySelectorAll('.beer-filter-btn');
    const beerCards = document.querySelectorAll('.beer-cards-grid .beer-card');

    if (beerFilterBtns.length > 0 && beerCards.length > 0) {
        beerFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                beerFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                beerCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.classList.remove('is-hidden');
                    } else {
                        card.classList.add('is-hidden');
                    }
                });
            });
        });
    }

    // GALLERY 페이지 탭 전환 (이미지 1번 버튼 vs 영상 2번 버튼)
    const galleryTabBtns = document.querySelectorAll('.gallery-tab-btn');
    const galleryImageView = document.getElementById('gallery-image-view');
    const galleryVideoView = document.getElementById('gallery-video-view');

    if (galleryTabBtns.length > 0 && galleryImageView && galleryVideoView) {
        galleryTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 활성화 클래스 토글
                galleryTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 탭 데이터에 따라 이미지 또는 영상 출력
                const tab = btn.getAttribute('data-tab');
                if (tab === 'image') {
                    galleryImageView.classList.remove('is-hidden');
                    galleryImageView.classList.add('active');
                    galleryVideoView.classList.add('is-hidden');
                    galleryVideoView.classList.remove('active');
                } else if (tab === 'video') {
                    galleryVideoView.classList.remove('is-hidden');
                    galleryVideoView.classList.add('active');
                    galleryImageView.classList.add('is-hidden');
                    galleryImageView.classList.remove('active');
                }
            });
        });
    }

    // GALLERY 페이지 이미지 클릭 시 모달 팝업 (#000000 80% 배경)
    const galleryModal = document.getElementById('gallery-modal');
    const galleryModalImg = document.getElementById('gallery-modal-img');
    const galleryModalTag = document.getElementById('gallery-modal-tag');
    const galleryModalTitle = document.getElementById('gallery-modal-title');
    const galleryModalClose = document.querySelector('.gallery-modal-close');
    const galleryModalBackdrop = document.querySelector('.gallery-modal-backdrop');
    const galleryFrames = document.querySelectorAll('.gallery-frame');

    if (galleryModal && galleryModalImg && galleryFrames.length > 0) {
        // 모달 열기
        galleryFrames.forEach(frame => {
            frame.addEventListener('click', () => {
                const img = frame.querySelector('.gallery-img');
                const tag = frame.querySelector('.frame-tag');
                const title = frame.querySelector('.frame-title');

                if (img) {
                    galleryModalImg.src = img.src;
                    galleryModalImg.alt = img.alt || '확대 이미지';
                    if (galleryModalTag) galleryModalTag.textContent = tag ? tag.textContent : '';
                    if (galleryModalTitle) galleryModalTitle.textContent = title ? title.textContent : '';

                    galleryModal.classList.add('is-open');
                    galleryModal.setAttribute('aria-hidden', 'false');
                    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
                }
            });
        });

        // 모달 닫기
        const closeGalleryModal = () => {
            galleryModal.classList.remove('is-open');
            galleryModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        if (galleryModalClose) {
            galleryModalClose.addEventListener('click', closeGalleryModal);
        }
        if (galleryModalBackdrop) {
            galleryModalBackdrop.addEventListener('click', closeGalleryModal);
        }

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && galleryModal.classList.contains('is-open')) {
                closeGalleryModal();
            }
        });
    }

    // BEER 페이지 맥주 카드 클릭 시 맥주 상세 정보 모달 팝업
    const beerModal = document.getElementById('beer-modal');
    const beerModalFileTitle = document.getElementById('beer-modal-file-title');
    const beerModalImg = document.getElementById('beer-modal-img');
    const beerModalColorDot = document.getElementById('beer-modal-color-dot');
    const beerModalColorName = document.getElementById('beer-modal-color-name');
    const beerModalSubhead = document.getElementById('beer-modal-subhead');
    const beerModalTitle = document.getElementById('beer-modal-title');
    const beerModalDescTitle = document.getElementById('beer-modal-desc-title');
    const beerModalSpecAbv = document.getElementById('beer-modal-spec-abv');
    const beerModalSpecIbu = document.getElementById('beer-modal-spec-ibu');
    const beerModalSpecExtra = document.getElementById('beer-modal-spec-extra');
    const beerModalClose = document.querySelector('.beer-modal-close');
    const beerModalBackdrop = document.querySelector('.beer-modal-backdrop');
    const beerCardsList = document.querySelectorAll('.beer-card');

    const beerDetailsData = {
        lager: {
            fileTitle: 'PRODUCT FILE - KOREAN LAGER',
            image: './assets/images/LAGER BEER MOCKUP.jpeg',
            colorDot: '#DDB86C',
            colorName: '라이트 골드 - BEER COLOR',
            subhead: 'SIGNATURE',
            title: 'GOGU LAGER',
            descTitle: '곡우 라거 • Korean Highland Helles',
            abv: '5.2%',
            ibu: '18',
            extra: 'HELLES',
            flavor: [82, 38, 24, 30],
            story: '첫 모금에 투명한 탄산감이 지나가고, 겉보리 특유의 고소한 단맛이 짧게 남습니다.<br>끝은 미련 없이 깨끗하게 잘려 나가는, 식탁을 위한 라거입니다.',
            ingredients: [
                '국산 겉보리 맥아 100%',
                '대관령 청정 암반수',
                '강원 홍천 홉',
                '저온 장기 숙성 라거 효모'
            ],
            foodPairing: [
                '해물 파전',
                '바삭한 먹태구이'
            ]
        },
        ale: {
            fileTitle: 'PRODUCT FILE - KOREAN PALE ALE',
            image: './assets/images/PALE ALE MOCKUP.jpeg',
            colorDot: '#FB9F03',
            colorName: '앰버 골드 - BEER COLOR',
            subhead: 'SIGNATURE',
            title: 'GOGU PALE ALE',
            descTitle: '곡우 페일 에일 • Korean Pale Ale',
            abv: '5.8%',
            ibu: '35',
            extra: 'PALE ALE',
            flavor: [65, 52, 58, 55],
            story: '감귤의 화사한 시트러스 아로마 뒤로 솔잎의 상쾌함이 스칩니다.<br>기분 좋은 쌉싸름함이 입안을 정돈하는 페일 에일입니다.',
            ingredients: [
                '국산 겉보리 맥아',
                '제주 영귤 껍질 (시트러스)',
                '캐스케이드 & 시트라 홉',
                '상면 발효 에일 효모'
            ],
            foodPairing: [
                '매콤한 닭강정',
                '미나리 새우전'
            ]
        },
        dark: {
            fileTitle: 'PRODUCT FILE - KOREAN DARK ALE',
            image: './assets/images/DARK BEER MOCKUP.jpeg',
            colorDot: '#2F1105',
            colorName: '딥 블랙 - BEER COLOR',
            subhead: 'SIGNATURE',
            title: 'GOGU DARK ALE',
            descTitle: '곡우 흑맥주 • Korean Dark Ale',
            abv: '6.5%',
            ibu: '28',
            extra: 'DARK ALE',
            flavor: [38, 70, 43, 82],
            story: '볶은 보리와 맥아의 묵직한 카카오 풍미, 은은하게 퍼지는 흑당의 단맛이<br>긴 여운을 남기는 깊고 짙은 흑맥주입니다.',
            ingredients: [
                '군산 검정보리 맥아',
                '고온 로스팅 볶은 보리',
                '지리산 천연 흑당',
                '다크 에일 전용 효모'
            ],
            foodPairing: [
                '훈제 숯불 갈비구이',
                '다크 초콜릿 브라우니'
            ]
        },
        seasonal: {
            fileTitle: 'PRODUCT FILE - SEASONAL • AUTUMN',
            image: './assets/images/감맥주 콘셉트 이미지 3ㄷ4.jpeg',
            colorDot: '#F0B41D',
            colorName: '어텀 골드 - BEER COLOR',
            subhead: 'SEASONAL',
            title: 'GOGU AUTUMN',
            descTitle: '곡우 어텀 에일 • Autumn Persimmon Ale',
            abv: '5.2%',
            ibu: '15',
            extra: 'PERSIMMON',
            flavor: [67, 60, 12, 45],
            story: '군산 곶감의 달콤한 농후함과 시나몬의 따스한 온기.<br>가을의 정취를 잔 속에 그대로 빚어낸 한정 맥주입니다.',
            ingredients: [
                '상주 완숙 곶감',
                '국산 겉보리 맥아',
                '시나몬 & 넛맥 스파이스',
                '가을 야생화 꿀'
            ],
            foodPairing: [
                '곶감 호두말이',
                '단호박 치즈구이'
            ]
        }
    };

    if (beerModal && beerCardsList.length > 0) {
        const bar1 = document.getElementById('beer-flavor-bar-1');
        const bar2 = document.getElementById('beer-flavor-bar-2');
        const bar3 = document.getElementById('beer-flavor-bar-3');
        const bar4 = document.getElementById('beer-flavor-bar-4');
        const num1 = document.getElementById('beer-flavor-val-1');
        const num2 = document.getElementById('beer-flavor-val-2');
        const num3 = document.getElementById('beer-flavor-val-3');
        const num4 = document.getElementById('beer-flavor-val-4');
        const storyDesc = document.getElementById('beer-modal-story-desc');
        const ingredientEls = beerModal.querySelectorAll('.beer-modal-ingredient');
        const pairingEls = beerModal.querySelectorAll('.beer-modal-pairing');

        beerCardsList.forEach(card => {
            card.addEventListener('click', () => {
                const beerKey = card.getAttribute('data-beer') || 'lager';
                const data = beerDetailsData[beerKey] || beerDetailsData.lager;

                if (beerModalFileTitle) beerModalFileTitle.textContent = data.fileTitle;
                if (beerModalImg) {
                    beerModalImg.src = data.image;
                    beerModalImg.alt = data.title;
                }
                if (beerModalColorDot) beerModalColorDot.style.backgroundColor = data.colorDot;
                if (beerModalColorName) beerModalColorName.textContent = data.colorName;
                if (beerModalSubhead) beerModalSubhead.textContent = data.subhead;
                if (beerModalTitle) beerModalTitle.textContent = data.title;
                if (beerModalDescTitle) beerModalDescTitle.textContent = data.descTitle;
                if (beerModalSpecAbv) beerModalSpecAbv.textContent = data.abv;
                if (beerModalSpecIbu) beerModalSpecIbu.textContent = data.ibu;
                if (beerModalSpecExtra) beerModalSpecExtra.textContent = data.extra;

                // FLAVER PROFILE 막대 및 수치 업데이트
                if (data.flavor) {
                    if (bar1) bar1.style.width = data.flavor[0] + '%';
                    if (bar2) bar2.style.width = data.flavor[1] + '%';
                    if (bar3) bar3.style.width = data.flavor[2] + '%';
                    if (bar4) bar4.style.width = data.flavor[3] + '%';
                    if (num1) num1.textContent = data.flavor[0];
                    if (num2) num2.textContent = data.flavor[1];
                    if (num3) num3.textContent = data.flavor[2];
                    if (num4) num4.textContent = data.flavor[3];
                }

                // 설명문 업데이트
                if (storyDesc && data.story) {
                    storyDesc.innerHTML = data.story;
                }

                // 원료 및 음식 페어링 텍스트 업데이트
                if (data.ingredients && ingredientEls.length > 0) {
                    data.ingredients.forEach((text, i) => {
                        if (ingredientEls[i]) ingredientEls[i].textContent = text;
                    });
                }
                if (data.foodPairing && pairingEls.length > 0) {
                    data.foodPairing.forEach((text, i) => {
                        if (pairingEls[i]) pairingEls[i].textContent = text;
                    });
                }

                beerModal.classList.add('is-open');
                beerModal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeBeerModal = () => {
            beerModal.classList.remove('is-open');
            beerModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        if (beerModalClose) {
            beerModalClose.addEventListener('click', closeBeerModal);
        }
        if (beerModalBackdrop) {
            beerModalBackdrop.addEventListener('click', closeBeerModal);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && beerModal.classList.contains('is-open')) {
                closeBeerModal();
            }
        });
    }

    // ==========================================================================
    // GOODS 페이지 굿즈 상세 모달 팝업 및 코스터 색상 전환 기능
    // ==========================================================================
    const goodsCards = document.querySelectorAll('.goods-card');
    const goodsModals = document.querySelectorAll('.goods-modal');

    if (goodsCards.length > 0 && goodsModals.length > 0) {
        // 모든 굿즈 모달 닫기
        const closeAllGoodsModals = () => {
            goodsModals.forEach(modal => {
                modal.classList.remove('is-open');
                modal.setAttribute('aria-hidden', 'true');
            });
            document.body.style.overflow = '';
        };

        // 카드 클릭 및 키보드 엔터 시 해당 모달 열기
        goodsCards.forEach(card => {
            const openModal = () => {
                const goodsType = card.getAttribute('data-goods');
                const targetModal = document.getElementById(`goods-modal-${goodsType}`);
                if (targetModal) {
                    closeAllGoodsModals();
                    targetModal.classList.add('is-open');
                    targetModal.setAttribute('aria-hidden', 'false');
                    document.body.style.overflow = 'hidden';
                }
            };

            card.addEventListener('click', openModal);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal();
                }
            });
        });

        // 닫기 버튼 및 백드롭 클릭
        goodsModals.forEach(modal => {
            const closeBtn = modal.querySelector('.goods-modal-close');
            const backdrop = modal.querySelector('.goods-modal-backdrop');

            if (closeBtn) closeBtn.addEventListener('click', closeAllGoodsModals);
            if (backdrop) backdrop.addEventListener('click', closeAllGoodsModals);
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMobileMenu();
                const hasOpenModal = Array.from(goodsModals).some(m => m.classList.contains('is-open'));
                if (hasOpenModal) {
                    closeAllGoodsModals();
                }
            }
        });

        // 코스터 색상 선택 원형 버튼 클릭 시 이미지 전환
        const colorBtns = document.querySelectorAll('.goods-color-btn');
        const coasterModalImg = document.getElementById('coaster-modal-img');

        if (colorBtns.length > 0 && coasterModalImg) {
            colorBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    colorBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const newImgSrc = btn.getAttribute('data-img');
                    if (newImgSrc) {
                        coasterModalImg.style.opacity = '0';
                        setTimeout(() => {
                            coasterModalImg.src = newImgSrc;
                            coasterModalImg.style.opacity = '1';
                        }, 150);
                    }
                });
            });
        }
    }
});

