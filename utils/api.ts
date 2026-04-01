/**
 * 学生端API接口封装
 */
const BASE_URL = 'https://cwxu-dev-eva.iepose.cn'
export interface BaseResponse<T = any> {
  message: string
  data?: T
  code?: number
  reason?: string
  metadata?: Record<string, any>
}
export interface LoginParams {
  stu_no: string
  card_no: string
  task_id: number
}
export interface LoginResponseData {
  student_no: string
  name: string
}
export interface StudentInfoParams {
  stuNo: string
}
export interface StudentInfoResponseData {
  id?: number
  name?: string
  sex?: string
  studentNo?: string
  idCardNo?: string
}
export interface TaskCoursesParams {
  taskId: string
  stuNo: string
}
export interface TeacherInfo {
  id: string
  name: string
  hasEvaluation: boolean
}
export interface CourseInfo {
  id: string
  name: string
  evaluationScore: number
  evaluationNum: number
  totalNum: number
  teacher: TeacherInfo[]
}
export interface TaskCoursesResponseData {
  course: CourseInfo[]
}

export interface EvaluationSubmitParams {
  taskId: number
  courseId: number
  teacherId: number
  stuNo: string
  /** 每个小项得分，JSON字符串如"[5,5,5,5,5,5,5,5,5,5]" */
  detailScore: string
  score: number
  comment: string
}

interface RequestConfig {
  url: string
  data?: any
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  header?: Record<string, string>
}

interface UniRequestResponse<T = any> {
  statusCode: number
  data: T
  header: any
  cookies: string[]
}

/**
 * 统一请求方法
 * @param url 请求地址
 * @param data 请求参数
 * @param method 请求方法
 * @param header 请求头
 * @returns Promise
 */
function request<T = any>(
  url: string,
  data: any = {},
  method: 'GET' | 'POST' = 'GET',
  header: Record<string, string> = {}
): Promise<T> {
  return new Promise((resolve, reject) => {
    const config: RequestConfig = {
      url: BASE_URL + url,
      data,
      method,
      header: {
        'Content-Type': 'application/json',
        ...header
      }
    }

    uni.request({
      ...config,
      success: (res: UniRequestResponse<BaseResponse<T>>) => {
        if (res.statusCode === 200) {
          resolve(res.data as T)
        } else {
          reject(res)
        }
      },
      fail: (err: any) => {
        reject(err)
      }
    })
  })
}

export class StudentAPI {
  /**
   * 学生登录
   * @param stuNo 学号
   * @param cardNo 身份证号
   * @param taskId 任务ID
   * @returns Promise
   */
  login(
    stuNo: string,
    cardNo: string,
    taskId: number
  ): Promise<BaseResponse<LoginResponseData>> {
    const params: LoginParams = {
      stu_no: stuNo,
      card_no: cardNo,
      task_id: taskId
    }
    return request<BaseResponse<LoginResponseData>>('/api/v1/auth/student/login', params, 'POST')
  }

  /**
   * 获取学生个人信息
   * @param stuNo 学号
   * @returns Promise
   */
  getStudentInfo(
    stuNo: string
  ): Promise<BaseResponse<StudentInfoResponseData>> {
    const params: StudentInfoParams = { stuNo }
    return request<BaseResponse<StudentInfoResponseData>>('/api/v1/auth/student/info', params, 'GET')
  }

  /**
   * 学生端根据学号和任务ID获取课程列表
   * @param taskId 任务ID
   * @param stuNo 学号
   * @returns Promise
   */
  getTaskCourses(
    taskId: string,
    stuNo: string
  ): Promise<BaseResponse<TaskCoursesResponseData>> {
    const params: TaskCoursesParams = { taskId, stuNo }
    return request<BaseResponse<TaskCoursesResponseData>>('/api/v1/task/student_task_detail', params, 'GET')
  }

  /**
   * 学生评价提交
   * @param evaluationData 评价数据
   * @returns Promise
   */
  submitEvaluation(
    evaluationData: EvaluationSubmitParams
  ): Promise<BaseResponse> {
    return request<BaseResponse>('/api/v1/task/submit_evaluation', evaluationData, 'POST')
  }
}

export default new StudentAPI()