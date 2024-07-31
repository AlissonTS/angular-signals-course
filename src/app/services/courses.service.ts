import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpContext,
  HttpContextToken,
} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { Course } from '../models/course.model';
import { GetCoursesResponse } from '../models/get-courses.response';
import { deleteCourse } from '../../../server/delete-course.route';
import { SkipLoading } from '../loading/skip-loading.component';
import { getCourseById } from '../../../server/get-courses.route';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  http = inject(HttpClient);

  env = environment;

  async loadAllCourses(): Promise<Course[]> {
    const courses$ = this.http.get<GetCoursesResponse>(
      `${this.env.apiRoot}/courses`,
      {
        context: new HttpContext().set(SkipLoading, false), // set to true in order to not show loading
      }
    );
    const response = await firstValueFrom(courses$);
    return response.courses;
  }

  async getCourseById(courseId: string): Promise<Course> {
    const course$ = this.http.get<Course>(
      `${this.env.apiRoot}/courses/${courseId}`
    );

    return firstValueFrom(course$);
  }

  async createCourse(course: Partial<Course>): Promise<Course> {
    const course$ = this.http.post<Course>(
      `${this.env.apiRoot}/courses`,
      course
    );

    return firstValueFrom(course$);
  }

  async saveCourse(courseId: string, course: Partial<Course>): Promise<Course> {
    const course$ = this.http.put<Course>(
      `${this.env.apiRoot}/courses/${courseId}`,
      course
    );

    return firstValueFrom(course$);
  }

  async deleteCourse(courseId: string): Promise<void> {
    const delete$ = this.http.delete<void>(
      `${this.env.apiRoot}/courses/${courseId}`
    );

    return firstValueFrom(delete$);
  }
}
