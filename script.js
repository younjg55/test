$(document).ready(function() {
    // 현재 날짜 표시
    const today = new Date();
    const dateString = today.getFullYear() + '.' + 
                      String(today.getMonth() + 1).padStart(2, '0') + '.' + 
                      String(today.getDate()).padStart(2, '0');
    $('#currentDate').text(dateString);

    // localStorage에서 할 일 목록 불러오기
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // 할 일 목록을 localStorage에 저장하는 함수
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // 수정 중인 할 일을 저장하는 변수
    let editingTask = null;

    // 마지막으로 수정된 할 일을 추적하는 변수
    let lastModifiedTask = null;

    // 새로운 할 일 요소를 생성하는 함수
    const createTaskElement = (task) => {
        const $li = $('<li>').addClass('task-item');
        
        // 마지막으로 수정된 할 일인 경우 recent 클래스 추가
        if (task === lastModifiedTask) {
            $li.addClass('recent');
        }

        const $checkbox = $('<div>')
            .addClass('checkbox')
            .toggleClass('checked', task.completed)
            .on('click', function() {
                task.completed = !task.completed;
                $(this).toggleClass('checked');
                lastModifiedTask = task;
                saveTasks();
                
                // 현재 선택된 탭에 따라 즉시 표시 여부 결정
                const currentFilter = $('.tab-button.active').data('filter');
                if ((currentFilter === 'active' && task.completed) || 
                    (currentFilter === 'completed' && !task.completed)) {
                    $li.fadeOut(300, function() {
                        $(this).remove();
                        // 페이지 정보 업데이트 및 목록 다시 렌더링
                        const filteredTasks = tasks.filter(task => {
                            if (currentFilter === 'active') return !task.completed;
                            if (currentFilter === 'completed') return task.completed;
                            return true;
                        });
                        const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
                        currentPage = Math.min(currentPage, Math.max(1, totalPages));
                        
                        // 현재 페이지가 비어있고 이전 페이지가 있다면 이전 페이지로 이동
                        if (filteredTasks.length > 0 && currentPage > 1) {
                            const currentPageTasks = filteredTasks.slice(
                                (currentPage - 1) * itemsPerPage,
                                currentPage * itemsPerPage
                            );
                            if (currentPageTasks.length === 0) {
                                currentPage--;
                            }
                        }
                        
                        updatePageInfo(totalPages);
                        renderTasks();
                    });
                } else {
                    renderTasks();
                }
            });

        const $taskText = $('<span>')
            .addClass('task-text')
            .text(task.text);

        const $dateInfo = $('<div>')
            .addClass('date-info');

        const $dateText = $('<span>')
            .addClass('date-text')
            .text(new Date(task.createdDate).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }));

        const $dueDate = $('<span>')
            .addClass('due-date')
            .text(task.dueDate ? `마감일: ${task.dueDate}` : '');

        const $editBtn = $('<button>')
            .addClass('edit-btn')
            .html('✎')
            .on('click', function() {
                editingTask = task;
                $('#taskInput').val(task.text);
                $('#taskDate').val(task.dueDate || '');
                $('#addButton').hide();
                $('#editButton').show();
            });

        const $deleteBtn = $('<button>')
            .addClass('delete-btn')
            .html('×')
            .on('click', function() {
                tasks = tasks.filter(t => t !== task);
                $li.fadeOut(300, function() {
                    $(this).remove();
                    saveTasks();
                    
                    // 페이지 정보 업데이트 및 목록 다시 렌더링
                    const currentFilter = $('.tab-button.active').data('filter');
                    const filteredTasks = tasks.filter(task => {
                        if (currentFilter === 'active') return !task.completed;
                        if (currentFilter === 'completed') return task.completed;
                        return true;
                    });
                    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
                    currentPage = Math.min(currentPage, Math.max(1, totalPages));
                    
                    // 현재 페이지가 비어있고 이전 페이지가 있다면 이전 페이지로 이동
                    if (filteredTasks.length > 0 && currentPage > 1) {
                        const currentPageTasks = filteredTasks.slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage
                        );
                        if (currentPageTasks.length === 0) {
                            currentPage--;
                        }
                    }
                    
                    updatePageInfo(totalPages);
                    renderTasks();
                });
            });

        $dateInfo.append($dateText, $dueDate);
        $li.append($checkbox, $taskText, $dateInfo, $editBtn, $deleteBtn);
        return $li;
    };

    // 페이징 관련 변수
    let currentPage = 1;
    const itemsPerPage = 5;

    // 페이지 정보 업데이트 함수
    const updatePageInfo = (totalPages) => {
        $('#pageInfo').text(`${currentPage} / ${totalPages}`);
        $('#prevPage').prop('disabled', currentPage === 1);
        $('#nextPage').prop('disabled', currentPage === totalPages);
    };

    // 모든 할 일을 화면에 표시하는 함수
    const renderTasks = () => {
        $('#taskList').empty();
        const currentFilter = $('.tab-button.active').data('filter');
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true; // 'all'인 경우
        });

        // 마감일자와 등록일자 순서로 정렬
        filteredTasks.sort((a, b) => {
            // 마감일자가 있는 경우 우선 정렬
            if (a.dueDate && !b.dueDate) return -1;
            if (!a.dueDate && b.dueDate) return 1;
            if (a.dueDate && b.dueDate) {
                // 마감일자로 정렬
                const dateA = new Date(a.dueDate);
                const dateB = new Date(b.dueDate);
                if (dateA < dateB) return -1;
                if (dateA > dateB) return 1;
            }
            // 마감일자가 같거나 없는 경우 등록일자로 정렬
            return new Date(b.createdDate) - new Date(a.createdDate);
        });

        const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
        currentPage = Math.min(currentPage, Math.max(1, totalPages));
        
        if (filteredTasks.length === 0) {
            $('#emptyMessage').show();
            $('.pagination').hide();
        } else {
            $('#emptyMessage').hide();
            $('.pagination').show();
            
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const tasksToShow = filteredTasks.slice(startIndex, endIndex);

            tasksToShow.forEach(task => {
                $('#taskList').append(createTaskElement(task));
            });
        }

        updatePageInfo(totalPages);
    };

    // 이전 페이지 버튼 클릭 이벤트
    $('#prevPage').on('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderTasks();
        }
    });

    // 다음 페이지 버튼 클릭 이벤트
    $('#nextPage').on('click', function() {
        const currentFilter = $('.tab-button.active').data('filter');
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });
        const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            renderTasks();
        }
    });

    // 탭 버튼 클릭 이벤트
    $('.tab-button').on('click', function() {
        $('.tab-button').removeClass('active');
        $(this).addClass('active');
        currentPage = 1; // 탭 변경 시 첫 페이지로 이동
        renderTasks();
    });

    // 새로운 할 일 추가
    $('#addButton').on('click', function() {
        const taskText = $('#taskInput').val().trim();
        const taskDate = $('#taskDate').val();
        
        if (taskText) {
            const newTask = {
                text: taskText,
                completed: false,
                createdDate: new Date().toISOString(),
                dueDate: taskDate || null
            };
            tasks.push(newTask);
            lastModifiedTask = newTask;
            
            // 진행중 탭으로 이동
            $('.tab-button').removeClass('active');
            $('.tab-button[data-filter="active"]').addClass('active');
            
            // 현재 필터에 따라 페이지 계산
            let filteredTasks = tasks.filter(task => !task.completed);
            
            // 마감일자와 등록일자 순서로 정렬
            filteredTasks.sort((a, b) => {
                if (a.dueDate && !b.dueDate) return -1;
                if (!a.dueDate && b.dueDate) return 1;
                if (a.dueDate && b.dueDate) {
                    const dateA = new Date(a.dueDate);
                    const dateB = new Date(b.dueDate);
                    if (dateA < dateB) return -1;
                    if (dateA > dateB) return 1;
                }
                return new Date(b.createdDate) - new Date(a.createdDate);
            });
            
            // 새로 추가된 할 일이 있는 페이지로 이동
            const taskIndex = filteredTasks.findIndex(t => t === newTask);
            if (taskIndex !== -1) {
                currentPage = Math.floor(taskIndex / itemsPerPage) + 1;
            }
            
            $('#taskInput').val('');
            $('#taskDate').val('');
            saveTasks();
            renderTasks();
        }
    });

    // Enter 키로 할 일 추가
    $('#taskInput').on('keypress', function(e) {
        if (e.key === 'Enter') {
            $('#addButton').click();
        }
    });

    // 수정 버튼 클릭 이벤트
    $('#editButton').on('click', function() {
        if (editingTask) {
            const taskText = $('#taskInput').val().trim();
            const taskDate = $('#taskDate').val();
            
            if (taskText) {
                editingTask.text = taskText;
                editingTask.dueDate = taskDate || null;
                lastModifiedTask = editingTask;
                saveTasks();
                
                // 현재 필터에 따라 페이지 계산
                const currentFilter = $('.tab-button.active').data('filter');
                const filteredTasks = tasks.filter(task => {
                    if (currentFilter === 'active') return !task.completed;
                    if (currentFilter === 'completed') return task.completed;
                    return true;
                });

                // 마감일자와 등록일자 순서로 정렬
                filteredTasks.sort((a, b) => {
                    if (a.dueDate && !b.dueDate) return -1;
                    if (!a.dueDate && b.dueDate) return 1;
                    if (a.dueDate && b.dueDate) {
                        const dateA = new Date(a.dueDate);
                        const dateB = new Date(b.dueDate);
                        if (dateA < dateB) return -1;
                        if (dateA > dateB) return 1;
                    }
                    return new Date(b.createdDate) - new Date(a.createdDate);
                });
                
                // 수정된 할 일이 현재 필터에 맞는지 확인
                const shouldShowInCurrentFilter = 
                    (currentFilter === 'active' && !editingTask.completed) ||
                    (currentFilter === 'completed' && editingTask.completed) ||
                    currentFilter === 'all';
                
                if (shouldShowInCurrentFilter) {
                    // 수정된 할 일이 있는 페이지 찾기
                    const taskIndex = filteredTasks.findIndex(t => t === editingTask);
                    if (taskIndex !== -1) {
                        currentPage = Math.floor(taskIndex / itemsPerPage) + 1;
                    }
                } else {
                    // 필터가 변경된 경우 첫 페이지로 이동
                    currentPage = 1;
                }
                
                $('#taskInput').val('');
                $('#taskDate').val('');
                $('#addButton').show();
                $('#editButton').hide();
                $('#cancelButton').hide();
                editingTask = null;
                
                renderTasks();
            }
        }
    });

    // 취소 버튼 추가
    const $cancelButton = $('<button>')
        .attr('id', 'cancelButton')
        .text('취소')
        .css('display', 'none')
        .on('click', function() {
            $('#taskInput').val('');
            $('#taskDate').val('');
            $('#addButton').show();
            $('#editButton').hide();
            $('#cancelButton').hide();
            editingTask = null;
        });

    $('.input-section').append($cancelButton);

    // 수정 버튼 클릭 시 취소 버튼 표시
    $('.edit-btn').on('click', function() {
        $('#cancelButton').show();
    });

    // 초기 할 일 목록 표시
    renderTasks();
}); 