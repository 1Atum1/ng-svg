
import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Directive({
  selector: '[ngSvg]'
})
export class NgSvgDirective implements AfterViewInit, OnChanges {
  @Input() fileName = 'icon-home';
  @Input() color = '#E95E4E';
  @Input() width: string;
  @Input() height: string;
  @Input() withHover = true;
  @Input() selected = false; // indicates that the element is selected and should not be enlarged on hover

  private elementColor: string; // #B2A49B
  private svgChildNodesArr: any[];
  private svgPathSource: any[] = [];

  constructor(
    private elementRef: ElementRef,
    private httpClient: HttpClient,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit() {
    this.httpClient
      .get(`./assets/svg/${this.fileName}.svg`, { responseType: 'text' })
      .subscribe((value) => {
        this.svgPathSource = [];
        this.renderer.setProperty(this.elementRef.nativeElement, 'innerHTML', value); // use DomSanitizer
        if (this.width && this.height) {
          this.elementRef.nativeElement.childNodes[0].setAttribute('width', this.width);
          this.elementRef.nativeElement.childNodes[0].setAttribute('height', this.height);
        }

        this.svgChildNodesArr = Array.from(this.elementRef.nativeElement.childNodes[0].childNodes);

        // set default icon color
        this.elementColor = this.getChildNodesWithPath(this.svgChildNodesArr)
          .find((node: any) => node.nodeName === 'path')
          .getAttribute('fill');

        // form an array with "path"
        this.getChildNodesWithPath(this.svgChildNodesArr).forEach((node: any) => {
          if (node.nodeName === 'path') {
            this.svgPathSource.push(node);
          }
        });

        if (this.selected) {
          this.setColor(this.color);
          this.scaleIcon(true);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('selected' in changes && this.elementRef.nativeElement.childNodes[0]) {
      this.scaleIcon(this.selected);
      this.setColor(changes['selected'].currentValue ? this.color : this.elementColor);
    }
  }

  @HostBinding('style.cursor') cursor = 'pointer';

  @HostListener('mouseenter') onMouseEnter() {
    if (!this.selected && this.withHover) {
      this.scaleIcon(true);
      // this.setColor(this.color);
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (!this.selected && this.withHover) {
      this.scaleIcon(false);
      // this.setColor(this.elementColor);
    }
  }

  private setColor(color: string): void {
    this.svgPathSource.forEach((v: any) => {
      v.setAttribute('fill', color);
    });
  }

  getChildNodesWithPath(source: any): any {
    return source.some((node: any) => node.nodeName === 'path')
      ? source
      : this.getChildNodesWithPath(
        Array.from(source.find((node: any) => node.nodeName === 'g').childNodes),
      );
  }

  scaleIcon(scale: boolean) {
    this.elementRef.nativeElement.childNodes[0].setAttribute(
      'width',
      scale ? String(Number(this.width) + Number(this.width) * 0.2) : this.width,
    );
    this.elementRef.nativeElement.childNodes[0].setAttribute(
      'height',
      scale ? String(Number(this.height) + Number(this.height) * 0.2) : this.height,
    );
  }
}

